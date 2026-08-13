from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

from drive_storage import upload_pdf_to_drive

from uuid import uuid4
from datetime import datetime, timezone

from auth.routes import router as auth_router, get_current_user
from database import documents_collection
from conversations.routes import router as conversations_router

from pdf_reader import extract_text
from chunking import create_chunks
from embeddings import create_embeddings
from vector_db import store_chunks

from rag import retrieve, build_prompt, generate_mcqs
from llm import generate_answer
from documents.routes import router as documents_router


# =========================================================
# APP
# =========================================================

app = FastAPI()

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(conversations_router)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.29.3:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to StudyGen AI Backend"
    }


# =========================================================
# UPLOAD DOCUMENT
# =========================================================

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # GET LOGGED-IN USER
    # -----------------------------------------------------

    user_id = str(current_user["_id"])

    # -----------------------------------------------------
    # GENERATE UNIQUE DOCUMENT ID
    # -----------------------------------------------------

    document_id = str(uuid4())

    # -----------------------------------------------------
    # CREATE UPLOAD DIRECTORY
    # -----------------------------------------------------

    upload_dir = Path("uploads")

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # -----------------------------------------------------
    # CREATE UNIQUE LOCAL FILE PATH
    # -----------------------------------------------------

    file_path = upload_dir / f"{document_id}_{file.filename}"

    # -----------------------------------------------------
    # SAVE FILE TEMPORARILY
    # -----------------------------------------------------

    file_content = await file.read()

    with open(file_path, "wb") as buffer:

        buffer.write(file_content)

    # -----------------------------------------------------
    # UPLOAD ORIGINAL PDF TO GOOGLE DRIVE
    # -----------------------------------------------------

    drive_file = upload_pdf_to_drive(
        str(file_path),
        file.filename
    )

    drive_file_id = drive_file["file_id"]

    # -----------------------------------------------------
    # EXTRACT TEXT
    # -----------------------------------------------------

    text = extract_text(
        str(file_path)
    )

    # -----------------------------------------------------
    # CREATE CHUNKS
    # -----------------------------------------------------

    chunks = create_chunks(
        text
    )

    # -----------------------------------------------------
    # CREATE EMBEDDINGS
    # -----------------------------------------------------

    embeddings = create_embeddings(
        chunks
    )

    # -----------------------------------------------------
    # STORE DOCUMENT INFORMATION IN MONGODB
    # -----------------------------------------------------

    documents_collection.insert_one({

        "user_id": user_id,

        "document_id": document_id,

        "filename": file.filename,

        "drive_file_id": drive_file_id,

        "characters": len(text),

        "chunks": len(chunks),

        "created_at": datetime.now(
            timezone.utc
        )

    })

    # -----------------------------------------------------
    # STORE CHUNKS IN CHROMA
    # -----------------------------------------------------

    store_chunks(
        chunks,
        embeddings,
        file.filename,
        user_id,
        document_id
    )

    # -----------------------------------------------------
    # DELETE TEMPORARY LOCAL PDF
    # -----------------------------------------------------

    try:

        file_path.unlink()

        print(
            f"Temporary file deleted: {file_path}"
        )

    except Exception as e:

        print(
            f"Could not delete temporary file: {e}"
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message": "File uploaded successfully.",

        "document_id": document_id,

        "filename": file.filename,

        "drive_file_id": drive_file_id,

        "characters": len(text),

        "chunks": len(chunks)

    }


# =========================================================
# REQUEST MODEL
# =========================================================

class QueryRequest(BaseModel):

    query: str
    document_id: str | None = None


# =========================================================
# ASK QUESTION
# =========================================================

@app.post("/ask")
def ask_question(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user)
):

    # =====================================================
    # CASUAL CHAT
    # =====================================================

    if not request.document_id:

        prompt = f"""
You are StudyGenAI, a helpful AI study assistant.

The user is having a casual conversation.

Answer the user's question naturally and helpfully.

Do not use uploaded PDF documents.
Do not retrieve anything from ChromaDB.

USER QUESTION:
{request.query}

ANSWER:
"""

        answer = generate_answer(prompt)

        return {
            "type": "casual",
            "content": answer
        }


    # =====================================================
    # PDF CHAT
    # =====================================================

    user_id = str(current_user["_id"])

    document_id = request.document_id

    # -----------------------------------------------------
    # VERIFY DOCUMENT BELONGS TO CURRENT USER
    # -----------------------------------------------------

    document = documents_collection.find_one({
        "user_id": user_id,
        "document_id": document_id
    })

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found or you do not have access to it."
        )

    # -----------------------------------------------------
    # RETRIEVE ONLY SELECTED PDF
    # -----------------------------------------------------

    results = retrieve(
        request.query,
        user_id,
        document_id,
        top_k=3
    )

    if not results:

        return {
            "type": "answer",
            "content": "I couldn't find relevant information in this document.",
            "document_id": document_id
        }

    # -----------------------------------------------------
    # BUILD PDF PROMPT
    # -----------------------------------------------------

    prompt = build_prompt(
        request.query,
        results
    )

    answer = generate_answer(prompt)

    return {
        "type": "answer",
        "content": answer,
        "document_id": document_id
    }


# =========================================================
# GENERATE QUIZ
# =========================================================

@app.post("/generate-quiz")
def generate_quiz(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user)
):

    user_id = str(current_user["_id"])

    document_id = request.document_id

    # -----------------------------------------------------
    # VERIFY DOCUMENT BELONGS TO USER
    # -----------------------------------------------------

    document = documents_collection.find_one({
        "user_id": user_id,
        "document_id": document_id
    })

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found or you do not have access to it."
        )

    # -----------------------------------------------------
    # GENERATE MCQs
    # -----------------------------------------------------

    result = generate_mcqs(
        request.query,
        user_id,
        document_id,
        10
    )

    return {
        "type": "quiz",
        "data": result,
        "document_id": document_id
    }