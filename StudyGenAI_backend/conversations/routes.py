from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

from auth.routes import get_current_user
from database import conversations_collection
from database import documents_collection


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class MessageRequest(BaseModel):
    sender: str
    content: str


# =========================================================
# GET ALL USER CONVERSATIONS
# =========================================================

@router.get("")
def get_conversations(
    current_user: dict = Depends(get_current_user)
):

    user_id = str(current_user["_id"])

    conversations = list(
        conversations_collection.find(
            {
                "user_id": user_id
            },
            {
                "_id": 0
            }
        )
    )

    return {
        "conversations": conversations
    }


# =========================================================
# GET ONE CONVERSATION
# =========================================================

@router.get("/{chat_id}")
def get_conversation(
    chat_id: str,
    current_user: dict = Depends(get_current_user)
):

    user_id = str(current_user["_id"])

    conversation = conversations_collection.find_one(
        {
            "user_id": user_id,
            "chat_id": chat_id
        },
        {
            "_id": 0
        }
    )

    if not conversation:

        return {
            "chat_id": chat_id,
            "messages": []
        }

    return conversation


# =========================================================
# ADD MESSAGE
# =========================================================

@router.post("/{chat_id}/messages")
def add_message(
    chat_id: str,
    request: MessageRequest,
    current_user: dict = Depends(get_current_user)
):

    user_id = str(current_user["_id"])

    # -----------------------------------------------------
    # VALIDATE SENDER
    # -----------------------------------------------------

    if request.sender not in ["user", "ai"]:

        raise HTTPException(
            status_code=400,
            detail="Invalid message sender."
        )


    # -----------------------------------------------------
    # DOCUMENT CHAT
    # -----------------------------------------------------

    document_id = None

    chat_type = "casual"


    if chat_id.startswith("document:"):

        chat_type = "document"

        document_id = chat_id.replace(
            "document:",
            "",
            1
        )


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
    # MESSAGE
    # -----------------------------------------------------

    message = {
        "sender": request.sender,
        "content": request.content,
        "created_at": datetime.now(timezone.utc)
    }


    # -----------------------------------------------------
    # FIND EXISTING CONVERSATION
    # -----------------------------------------------------

    existing = conversations_collection.find_one({
        "user_id": user_id,
        "chat_id": chat_id
    })


    # -----------------------------------------------------
    # CREATE CONVERSATION
    # -----------------------------------------------------

    if not existing:

        conversation = {
            "user_id": user_id,
            "chat_id": chat_id,
            "type": chat_type,
            "document_id": document_id,
            "messages": [message],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        conversations_collection.insert_one(
            conversation
        )


    # -----------------------------------------------------
    # APPEND MESSAGE
    # -----------------------------------------------------

    else:

        conversations_collection.update_one(
            {
                "user_id": user_id,
                "chat_id": chat_id
            },
            {
                "$push": {
                    "messages": message
                },
                "$set": {
                    "updated_at": datetime.now(
                        timezone.utc
                    )
                }
            }
        )


    return {
        "message": "Message saved successfully.",
        "chat_id": chat_id
    }


# =========================================================
# DELETE CONVERSATION
# =========================================================

@router.delete("/{chat_id}")
def delete_conversation(
    chat_id: str,
    current_user: dict = Depends(get_current_user)
):

    user_id = str(current_user["_id"])

    result = conversations_collection.delete_one({
        "user_id": user_id,
        "chat_id": chat_id
    })


    return {
        "message": "Conversation deleted successfully.",
        "chat_id": chat_id,
        "deleted": result.deleted_count > 0
    }