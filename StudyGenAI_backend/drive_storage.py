from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

import os


# =========================================================
# GOOGLE DRIVE CONFIGURATION
# =========================================================

SCOPES = [
    "https://www.googleapis.com/auth/drive.file"
]


# =========================================================
# CREDENTIAL FILE PATHS
# =========================================================

# Render Secret Files
if os.path.exists("/etc/secrets/credentials.json"):

    CREDENTIALS_FILE = "/etc/secrets/credentials.json"
    TOKEN_FILE = "/etc/secrets/token.json"

# Local development
else:

    CREDENTIALS_FILE = "credentials.json"
    TOKEN_FILE = "token.json"


DRIVE_FOLDER_NAME = "StudyGenAI"


# =========================================================
# GET GOOGLE DRIVE SERVICE
# =========================================================

def get_drive_service():

    creds = None


    # -----------------------------------------------------
    # EXISTING TOKEN
    # -----------------------------------------------------

    if os.path.exists(TOKEN_FILE):

        creds = Credentials.from_authorized_user_file(
            TOKEN_FILE,
            SCOPES
        )


    # -----------------------------------------------------
    # REFRESH / AUTHENTICATE
    # -----------------------------------------------------

    if not creds or not creds.valid:

        # Refresh expired token
        if creds and creds.expired and creds.refresh_token:

            creds.refresh(Request())


        # Local authentication
        else:

            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE,
                SCOPES
            )

            creds = flow.run_local_server(
                port=0
            )


        # -------------------------------------------------
        # SAVE TOKEN
        # -------------------------------------------------

        # Don't try to overwrite Render Secret File
        if not TOKEN_FILE.startswith("/etc/secrets/"):

            with open(TOKEN_FILE, "w") as token:

                token.write(
                    creds.to_json()
                )


    # -----------------------------------------------------
    # BUILD GOOGLE DRIVE SERVICE
    # -----------------------------------------------------

    service = build(
        "drive",
        "v3",
        credentials=creds
    )


    return service


# =========================================================
# FIND STUDYGEN AI FOLDER
# =========================================================

def get_studygen_folder(service):

    results = service.files().list(

        q=(
            f"name = '{DRIVE_FOLDER_NAME}' "
            "and mimeType = 'application/vnd.google-apps.folder' "
            "and trashed = false"
        ),

        spaces="drive",

        fields="files(id, name)"

    ).execute()


    folders = results.get(
        "files",
        []
    )


    if not folders:

        raise Exception(
            "StudyGenAI folder was not found in Google Drive."
        )


    return folders[0]["id"]


# =========================================================
# UPLOAD PDF
# =========================================================

def upload_pdf_to_drive(
    file_path,
    filename
):

    service = get_drive_service()


    # -----------------------------------------------------
    # FIND STUDYGEN AI FOLDER
    # -----------------------------------------------------

    folder_id = get_studygen_folder(
        service
    )


    # -----------------------------------------------------
    # FILE METADATA
    # -----------------------------------------------------

    file_metadata = {

        "name": filename,

        "parents": [
            folder_id
        ]

    }


    # -----------------------------------------------------
    # PDF UPLOAD
    # -----------------------------------------------------

    media = MediaFileUpload(

        file_path,

        mimetype="application/pdf"

    )


    uploaded_file = service.files().create(

        body=file_metadata,

        media_body=media,

        fields="id, name, mimeType, parents"

    ).execute()


    # -----------------------------------------------------
    # RETURN DRIVE INFORMATION
    # -----------------------------------------------------

    return {

        "file_id":
            uploaded_file["id"],

        "name":
            uploaded_file["name"],

        "mime_type":
            uploaded_file["mimeType"]

    }


# =========================================================
# DELETE PDF FROM GOOGLE DRIVE
# =========================================================

def delete_pdf_from_drive(
    drive_file_id
):

    service = get_drive_service()


    service.files().delete(

        fileId=drive_file_id

    ).execute()


    return True