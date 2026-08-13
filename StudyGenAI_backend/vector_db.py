import os
import chromadb

from dotenv import load_dotenv

load_dotenv()


# =========================================================
# CHROMA CLOUD
# =========================================================

client = chromadb.CloudClient(
    api_key=os.getenv("CHROMA_API_KEY"),
    tenant=os.getenv("CHROMA_TENANT"),
    database=os.getenv("CHROMA_DATABASE")
)


# =========================================================
# COLLECTION
# =========================================================

collection = client.get_or_create_collection(
    name="study_documents"
)


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
    """
    Store document chunks in ChromaDB.

    Each chunk belongs to:
        user_id
        document_id
        filename
        chunk_index
    """

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

    result = collection.get(
        include=[
            "documents",
            "metadatas"
        ]
    )

    print("IDs:")
    print(result["ids"])

    print("\nMetadata:")
    print(result["metadatas"])

    return result


# =========================================================
# DELETE ONE DOCUMENT
# =========================================================

# =========================================================
# DELETE ONE DOCUMENT
# =========================================================

def delete_document(user_id, document_id):
    """
    Delete ONLY the ChromaDB chunks belonging to
    the specified user and document.
    """

    print("\n========== CHROMA DELETE ==========")
    print("User ID:", user_id)
    print("Document ID:", document_id)

    # -----------------------------------------------------
    # Find matching chunks first
    # -----------------------------------------------------

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
    print("IDs:", ids_to_delete)

    # -----------------------------------------------------
    # Nothing found
    # -----------------------------------------------------

    if not ids_to_delete:
        print("No Chroma chunks found for this document.")
        print("===================================\n")
        return

    # -----------------------------------------------------
    # Delete ONLY those IDs
    # -----------------------------------------------------

    collection.delete(
        ids=ids_to_delete
    )

    # -----------------------------------------------------
    # Verify deletion
    # -----------------------------------------------------

    check = collection.get(
        ids=ids_to_delete,
        include=[
            "metadatas"
        ]
    )

    print("Remaining deleted IDs:", check.get("ids", []))
    print("===================================\n")