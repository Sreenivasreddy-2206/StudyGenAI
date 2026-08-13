from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

import os


# =========================================================
# GOOGLE DRIVE PERMISSION
# =========================================================

SCOPES = [
    "https://www.googleapis.com/auth/drive.file"
]


# =========================================================
# AUTHENTICATION
# =========================================================

creds = None

if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file(
        "token.json",
        SCOPES
    )

if not creds or not creds.valid:

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())

    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json",
            SCOPES
        )

        creds = flow.run_local_server(port=0)

    with open("token.json", "w") as token:
        token.write(creds.to_json())


# =========================================================
# CONNECT TO GOOGLE DRIVE
# =========================================================

service = build(
    "drive",
    "v3",
    credentials=creds
)


# =========================================================
# STUDYGEN AI FOLDER
# =========================================================

FOLDER_NAME = "StudyGenAI"


# Find the folder we created earlier
results = service.files().list(
    q=(
        "name = 'StudyGenAI' "
        "and mimeType = 'application/vnd.google-apps.folder' "
        "and trashed = false"
    ),
    spaces="drive",
    fields="files(id, name)"
).execute()


folders = results.get("files", [])


if not folders:
    raise Exception("StudyGenAI folder was not found in Google Drive.")


folder_id = folders[0]["id"]


# =========================================================
# PDF TO UPLOAD
# =========================================================

file_path = r"S:\StudyGenAI\backend\uploads\SpringBoot.pdf"


if not os.path.exists(file_path):
    raise FileNotFoundError(
        f"PDF not found: {file_path}"
    )


# =========================================================
# UPLOAD PDF
# =========================================================

file_metadata = {
    "name": "SpringBoot.pdf",
    "parents": [folder_id]
}


media = MediaFileUpload(
    file_path,
    mimetype="application/pdf"
)


uploaded_file = service.files().create(
    body=file_metadata,
    media_body=media,
    fields="id, name, mimeType, parents"
).execute()


# =========================================================
# RESULT
# =========================================================

print("\n========== GOOGLE DRIVE UPLOAD ==========")

print("Upload successful!")

print("File name:", uploaded_file["name"])

print("File ID:", uploaded_file["id"])

print("Folder ID:", folder_id)

print("=========================================\n")