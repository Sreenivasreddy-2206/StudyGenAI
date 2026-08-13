# 📚 StudyGen AI

StudyGen AI is an AI-powered learning platform where users can upload PDF documents, ask questions about them, generate quizzes, and have AI-powered conversations.

The application uses **RAG (Retrieval-Augmented Generation)** to answer questions based on uploaded documents.

---

## 🚀 Features

- 🔐 User Registration and Login
- 🔑 JWT Authentication
- 📄 Upload PDF Documents
- 💾 Persistent User Documents
- 💬 Casual AI Chat
- 📚 Ask Questions About Uploaded PDFs
- 🧠 RAG-Based Document Question Answering
- ❓ AI Quiz Generation
- 💾 Persistent Chat History
- 🗑️ Delete Documents
- 🗑️ Delete Conversations
- ☁️ Google Drive PDF Storage
- 🗄️ MongoDB Database
- 🎨 Modern React UI

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React
- React Markdown

### Backend

- Python
- FastAPI
- Uvicorn
- MongoDB
- JWT Authentication
- ChromaDB
- OpenAI
- PyMuPDF
- Google Drive API

---

## 📁 Project Structure

```text
StudyGenAI/
│
├── StudyGenAI_backend/
│   ├── auth/
│   │   ├── auth_utils.py
│   │   ├── models.py
│   │   └── routes.py
│   │
│   ├── conversations/
│   │   └── routes.py
│   │
│   ├── documents/
│   │   └── routes.py
│   │
│   ├── app.py
│   ├── database.py
│   ├── rag.py
│   ├── vector_db.py
│   ├── embeddings.py
│   ├── llm.py
│   ├── chunking.py
│   ├── pdf_reader.py
│   ├── drive_storage.py
│   ├── requirements.txt
│   └── .env
│
├── StudyGenAI_frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md

⚙️ Installation
1. Clone the Repository
git clone https://github.com/Sreenivasreddy-2206/StudyGenAI.git
cd StudyGenAI


🔧 Backend Setup

Open a terminal:

cd StudyGenAI_backend

Create a virtual environment:

python -m venv venv

Activate it.

Windows PowerShell
.\venv\Scripts\Activate.ps1
Windows CMD
venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt


🔐 Environment Variables

Create a .env file inside:

StudyGenAI_backend/.env

Add your environment variables:

MONGODB_URL=your_mongodb_connection_string

JWT_SECRET_KEY=your_secret_key

OPENAI_API_KEY=your_openai_api_key

Add any other required API keys used in your project.


▶️ Run Backend
uvicorn app:app --reload

Backend will run at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs




🎨 Frontend Setup

Open another terminal.

Move to the frontend folder:

cd StudyGenAI_frontend

Install dependencies:

npm install

Run the frontend:

npm run dev

Open:

http://localhost:3000

User
  │
  ▼
React Frontend
  │
  ▼
FastAPI Backend
  │
  ├── Authentication
  │       │
  │       ▼
  │    MongoDB
  │
  ├── PDF Upload
  │       │
  │       ├── Google Drive Storage
  │       │
  │       ▼
  │    PDF Processing
  │       │
  │       ▼
  │    Text Chunking
  │       │
  │       ▼
  │    Embeddings
  │       │
  │       ▼
  │    ChromaDB
  │
  └── User Question
          │
          ▼
      Relevant Chunks
          │
          ▼
        OpenAI
          │
          ▼
       AI Response




🧠 How RAG Works
User uploads a PDF.
The PDF text is extracted.
The text is divided into smaller chunks.
Embeddings are generated for the chunks.
Embeddings are stored in ChromaDB.
When the user asks a question, relevant chunks are retrieved.
The retrieved context is sent to the AI model.
The AI generates an answer based on the document context.


🔑 Authentication Flow

Register / Login
        │
        ▼
FastAPI
        │
        ▼
MongoDB
        │
        ▼
JWT Token Generated
        │
        ▼
Stored in Browser Local Storage
        │
        ▼
Protected API Requests



📦 Main Dependencies

Backend dependencies are installed using:

pip install -r requirements.txt

Frontend dependencies are installed using:

npm install



👨‍💻 Author

Sreenivas Reddy

GitHub: https://github.com/Sreenivasreddy-2206


⭐ Future Improvements
Deploy frontend and backend
Improve RAG retrieval
Streaming AI responses
Better document management
Conversation search
Multiple document chat
User profile management
Usage analytics









