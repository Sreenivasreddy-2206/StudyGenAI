from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from bson import ObjectId

from database import users_collection

from auth.models import (
    RegisterRequest,
    LoginRequest
)

from auth.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# BEARER AUTHENTICATION
# =========================================================

security = HTTPBearer()


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token."
        )

    try:

        user = users_collection.find_one({
            "_id": ObjectId(user_id)
        })

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid user ID."
        )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return user


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(request: RegisterRequest):

    email = request.email.lower().strip()

    # Check existing account
    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    # Hash password
    hashed_password = hash_password(
        request.password
    )

    # Create user
    user = {
        "name": request.name.strip(),
        "email": email,
        "password": hashed_password
    }

    # Insert user
    result = users_collection.insert_one(user)

    # =====================================================
    # CREATE JWT IMMEDIATELY AFTER REGISTRATION
    # =====================================================

    token = create_access_token(
        str(result.inserted_id)
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "message": "Account created successfully.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "name": user["name"],
            "email": user["email"]
        }
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(request: LoginRequest):

    email = request.email.lower().strip()

    user = users_collection.find_one({
        "email": email
    })

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    password_valid = verify_password(
        request.password,
        user["password"]
    )

    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token = create_access_token(
        str(user["_id"])
    )

    return {
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
def me(
    current_user: dict = Depends(get_current_user)
):

    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"]
    }