from fastapi import APIRouter, Depends, HTTPException

from database import documents_collection
from auth.routes import get_current_user

from vector_db import delete_document as delete_chroma_document
from drive_storage import delete_pdf_from_drive


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# =========================================================
# GET ALL DOCUMENTS FOR LOGGED-IN USER
# =========================================================

@router.get("/")
def get_user_documents(
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # CURRENT USER
    # -----------------------------------------------------

    user_id = str(current_user["_id"])


    # -----------------------------------------------------
    # FIND ONLY THIS USER'S DOCUMENTS
    # -----------------------------------------------------

    documents = list(
        documents_collection.find(
            {
                "user_id": user_id
            },
            {
                "_id": 0
            }
        ).sort(
            "created_at",
            -1
        )
    )


    # -----------------------------------------------------
    # RETURN DOCUMENTS
    # -----------------------------------------------------

    return {
        "documents": documents
    }


# =========================================================
# DELETE DOCUMENT
# =========================================================

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):

    # -----------------------------------------------------
    # CURRENT USER
    # -----------------------------------------------------

    user_id = str(current_user["_id"])


    # -----------------------------------------------------
    # FIND DOCUMENT
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
    # GET GOOGLE DRIVE FILE ID
    # -----------------------------------------------------

    drive_file_id = document.get(
        "drive_file_id"
    )


    # -----------------------------------------------------
    # DELETE FROM GOOGLE DRIVE
    # -----------------------------------------------------

    if drive_file_id:

        try:

            delete_pdf_from_drive(
                drive_file_id
            )

        except Exception as e:

            print(
                "Google Drive deletion failed:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail="Failed to delete PDF from Google Drive."
            )


    # -----------------------------------------------------
    # DELETE FROM CHROMA
    # -----------------------------------------------------

    try:

        delete_chroma_document(
            user_id,
            document_id
        )

    except Exception as e:

        print(
            "Chroma deletion failed:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete document chunks from Chroma."
        )


    # -----------------------------------------------------
    # DELETE FROM MONGODB
    # -----------------------------------------------------

    result = documents_collection.delete_one({
        "user_id": user_id,
        "document_id": document_id
    })


    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Document could not be deleted."
        )


    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    return {
        "message": "Document deleted successfully.",
        "document_id": document_id
    }