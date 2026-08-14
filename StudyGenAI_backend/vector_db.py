import os
import chromadb

from dotenv import load_dotenv

load_dotenv()


# =========================================================
# CHROMA CLOUD CONFIG
# =========================================================

client = None
collection = None


# =========================================================
# GET COLLECTION
# =========================================================

def get_collection():

    global client
    global collection

    if collection is None:

        print("Connecting to Chroma Cloud...")

        client = chromadb.CloudClient(
            api_key=os.getenv("CHROMA_API_KEY"),
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE")
        )

        collection = client.get_or_create_collection(
            name="study_documents"
        )

        print("Connected to Chroma Cloud.")

    return collection


# =========================================================
# STORE DOCUMENT CHUNKS
# =========================================================

def store_chunks(
    chunks,
    embeddings,
    filename,
    user_id,
    document_id
):

    collection = get_collection()

    ids = [
        f"{user_id}_{document_id}_{i}"
        for i in range(len(chunks))
    ]

    metadatas = [
        {
            "user_id": user_id,
            "document_id": document_id,
            "filename": filename,
            "chunk_index": i
        }
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas
    )


# =========================================================
# GET ALL STORED DATA
# =========================================================

def get_all_chunks():

    collection = get_collection()

    result = collection.get(
        include=[
            "documents",
            "metadatas"
        ]
    )

    return result


# =========================================================
# DELETE DOCUMENT
# =========================================================

def delete_document(user_id, document_id):

    collection = get_collection()

    print("\n========== CHROMA DELETE ==========")
    print("User ID:", user_id)
    print("Document ID:", document_id)

    result = collection.get(
        where={
            "$and": [
                {
                    "user_id": {
                        "$eq": user_id
                    }
                },
                {
                    "document_id": {
                        "$eq": document_id
                    }
                }
            ]
        },
        include=[
            "metadatas"
        ]
    )

    ids_to_delete = result.get("ids", [])

    print("Chunks found:", len(ids_to_delete))

    if not ids_to_delete:

        print("No Chroma chunks found.")

        return

    collection.delete(
        ids=ids_to_delete
    )

    print("Document chunks deleted.")
    print("===================================\n")