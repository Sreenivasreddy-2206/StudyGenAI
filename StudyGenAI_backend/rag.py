from embeddings import create_embeddings
from vector_db import get_collection
from llm import generate_answer

import json
import re


# =========================================================
# RETRIEVE
# =========================================================
def retrieve(query, user_id, document_id, top_k=3):

    collection = get_collection()

    query_embedding = create_embeddings([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
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
            "documents",
            "metadatas",
            "distances"
        ]
    )

    return results



# =========================================================
# BUILD PROMPT
# =========================================================

def build_prompt(query, results):
    """
    Build a prompt using ONLY the retrieved chunks.
    """

    documents = results.get(
        "documents",
        [[]]
    )[0]

    # -----------------------------------------------------
    # No relevant documents
    # -----------------------------------------------------

    if not documents:

        context = "No relevant information was found."

    else:

        context = "\n\n".join(
            documents
        )

    # -----------------------------------------------------
    # Prompt
    # -----------------------------------------------------

    prompt = f"""
You are StudyGenAI, an AI study assistant.

Answer the user's question using ONLY the provided document context.

IMPORTANT RULES:

- Use only the provided document context.
- Do not use information from other documents.
- Do not use outside knowledge.
- Do not invent information.
- If the answer is not present in the document, say:
  "I couldn't find that information in the uploaded document."

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{query}

ANSWER:
"""

    return prompt


# =========================================================
# GENERATE MCQs
# =========================================================

def generate_mcqs(
    query,
    user_id,
    document_id,
    number_of_questions=10
):
    """
    Generate MCQs using ONLY the selected document
    belonging to the logged-in user.
    """

    # -----------------------------------------------------
    # Retrieve ONLY selected document
    # -----------------------------------------------------

    results = retrieve(
        query,
        user_id,
        document_id,
        top_k=5
    )

    # -----------------------------------------------------
    # Extract documents
    # -----------------------------------------------------

    documents = results.get(
        "documents",
        [[]]
    )[0]

    # -----------------------------------------------------
    # No content found
    # -----------------------------------------------------

    if not documents:

        raise ValueError(
            "No relevant information was found in this document."
        )

    context = "\n\n".join(
        documents
    )

    # -----------------------------------------------------
    # Build quiz prompt
    # -----------------------------------------------------

    prompt = f"""
You are StudyGenAI, an AI study assistant.

Generate {number_of_questions} multiple-choice questions
using ONLY the provided document context.

IMPORTANT RULES:

- Every question must be based ONLY on the document.
- Do not use outside knowledge.
- Do not use information from other documents.
- Each question must have exactly 4 options.
- Provide the correct answer.
- Provide a short explanation.
- Return ONLY valid JSON.
- Do not use markdown code fences.

Required JSON format:

{{
    "questions": [
        {{
            "question": "Question text",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "answer": "Correct option",
            "explanation": "Short explanation"
        }}
    ]
}}

DOCUMENT CONTEXT:

{context}

USER REQUEST:

{query}
"""

    # -----------------------------------------------------
    # Generate using Gemini
    # -----------------------------------------------------

    response = generate_answer(
        prompt
    )

    response = response.strip()

    # -----------------------------------------------------
    # Remove markdown code fences
    # -----------------------------------------------------

    response = re.sub(
        r"^```json\s*",
        "",
        response,
        flags=re.IGNORECASE
    )

    response = re.sub(
        r"^```\s*",
        "",
        response
    )

    response = re.sub(
        r"\s*```$",
        "",
        response
    )

    response = response.strip()

    # -----------------------------------------------------
    # Convert Gemini response to JSON
    # -----------------------------------------------------

    try:

        return json.loads(
            response
        )

    except json.JSONDecodeError:

        raise ValueError(
            "Gemini returned an invalid quiz response."
        )