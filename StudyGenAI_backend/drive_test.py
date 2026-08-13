from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from googleapiclient.discovery import build

import os


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
# CREATE STUDYGEN AI FOLDER
# =========================================================

folder_metadata = {
    "name": "StudyGenAI",
    "mimeType": "application/vnd.google-apps.folder"
}

folder = service.files().create(
    body=folder_metadata,
    fields="id, name"
).execute()


print("\n========== GOOGLE DRIVE ==========")
print("Folder created successfully!")
print("Name:", folder["name"])
print("Folder ID:", folder["id"])
print("==================================")