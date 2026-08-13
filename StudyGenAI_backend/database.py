import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from .env")

client = MongoClient(MONGO_URI)

db = client["StudyGenAI"]

users_collection = db["users"]
documents_collection = db["documents"]
conversations_collection = db["conversations"]
quiz_history_collection = db["quiz_history"]