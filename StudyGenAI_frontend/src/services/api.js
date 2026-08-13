/**
 * StudyGen AI API Service
 *
 * Frontend: http://localhost:3000
 * Backend:  http://127.0.0.1:8000
 *
 * Vite proxies /api → FastAPI backend.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";


// =========================================================
// TOKEN
// =========================================================

const getToken = () => {
  return localStorage.getItem("studygen_token");
};


// =========================================================
// CENTRAL REQUEST FUNCTION
// =========================================================
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...options.headers,
  };

  // JWT
  const token = getToken();
  console.log("API REQUEST:", endpoint);
console.log("TOKEN FOUND:", token);
console.log("AUTH DISABLED:", options.auth === false);

  if (token && options.auth !== false) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // JSON CONTENT TYPE
  if (
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // =====================================================
    // HANDLE ERRORS
    // =====================================================

    if (!response.ok) {
      let message =
        `Request failed with status ${response.status}`;

      // FastAPI error response
      if (data && typeof data === "object") {

        // Normal error
        if (typeof data.detail === "string") {
          message = data.detail;
        }

        // Validation errors - 422
        else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((item) => {
              const field =
                Array.isArray(item.loc)
                  ? item.loc[item.loc.length - 1]
                  : "";

              return field
                ? `${field}: ${item.msg}`
                : item.msg;
            })
            .join(". ");
        }

        // Other error
        else if (typeof data.message === "string") {
          message = data.message;
        }

        else {
          message = JSON.stringify(data);
        }

      } else if (typeof data === "string") {
        message = data;
      }

      const error = new Error(message);

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;

  } catch (err) {

    // Network error
    if (
      err.name === "TypeError" &&
      (
        err.message.includes("fetch") ||
        err.message.includes("Failed")
      )
    ) {
      const offlineError = new Error(
        "Unable to connect to StudyGen AI backend."
      );

      offlineError.isNetworkError = true;

      throw offlineError;
    }

    throw err;
  }
}



// =========================================================
// API
// =========================================================

export const api = {


  // =======================================================
  // AUTHENTICATION
  // =======================================================


  // =======================================================
  // REGISTER
  // =======================================================

  async registerUser({
    name,
    email,
    password,
  }) {

    return request(
      "/auth/register",
      {
        method: "POST",
        auth: false,

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );
  },


  // =======================================================
  // LOGIN
  // =======================================================

  async loginUser({
    email,
    password,
  }) {

    return request(
      "/auth/login",
      {
        method: "POST",
        auth: false,

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  },


  // =======================================================
  // CURRENT USER
  // =======================================================

  async getCurrentUser() {

    return request(
      "/auth/me",
      {
        method: "GET",
      }
    );
  },


  // =======================================================
  // DOCUMENTS
  // =======================================================


  // =======================================================
  // UPLOAD PDF
  // =======================================================

  async uploadDocument(file) {

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    return request(
      "/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  },


  // =======================================================
  // GET USER DOCUMENTS
  // =======================================================

  
async getDocuments() {

  const token = localStorage.getItem("studygen_token");

  return request(
    "/documents/",
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

},

  // =======================================================
  // DELETE ONE DOCUMENT
  // =======================================================

  async deleteDocument(document_id) {

    if (!document_id) {

      throw new Error(
        "document_id is required."
      );

    }

    return request(
      `/documents/${encodeURIComponent(document_id)}`,
      {
        method: "DELETE",
      }
    );
  },


  // =======================================================
  // AI
  // =======================================================


  // =======================================================
  // ASK ABOUT CURRENT PDF / CASUAL CHAT
  // =======================================================

  async askQuestion({
    query,
    document_id = null,
  }) {

    const bodyPayload = {
      query,
    };


    // -----------------------------------------------------
    // Only include document_id for PDF chat
    // -----------------------------------------------------

    if (document_id) {

      bodyPayload.document_id =
        document_id;

    }


    return request(
      "/ask",
      {
        method: "POST",

        body: JSON.stringify(
          bodyPayload
        ),
      }
    );
  },


  // =======================================================
  // GENERATE QUIZ
  // =======================================================

  async generateQuiz({
    query = "Generate 10 MCQs",
    document_id,
  }) {

    if (!document_id) {

      throw new Error(
        "document_id is required to generate a quiz."
      );

    }


    return request(
      "/generate-quiz",
      {
        method: "POST",

        body: JSON.stringify({
          query,
          document_id,
        }),
      }
    );
  },


  // =======================================================
  // CONVERSATIONS
  // =======================================================


  // =======================================================
  // GET ALL USER CONVERSATIONS
  // GET /conversations
  // =======================================================

  async getConversations() {

    return request(
      "/conversations",
      {
        method: "GET",
      }
    );
  },


  // =======================================================
  // GET ONE CONVERSATION
  // GET /conversations/{chat_id}
  // =======================================================

  async getConversation(chat_id) {

    if (!chat_id) {

      throw new Error(
        "chat_id is required."
      );

    }


    return request(
      `/conversations/${encodeURIComponent(chat_id)}`,
      {
        method: "GET",
      }
    );
  },


  // =======================================================
  // SAVE MESSAGE
  // POST /conversations/{chat_id}/messages
  // =======================================================

  async saveMessage({
    chat_id,
    sender,
    content,
  }) {

    if (!chat_id) {

      throw new Error(
        "chat_id is required."
      );

    }


    if (!sender) {

      throw new Error(
        "sender is required."
      );

    }


    if (!content) {

      throw new Error(
        "content is required."
      );

    }


    return request(
      `/conversations/${encodeURIComponent(chat_id)}/messages`,
      {
        method: "POST",

        body: JSON.stringify({
          sender,
          content,
        }),
      }
    );
  },


  // =======================================================
  // DELETE CONVERSATION
  // DELETE /conversations/{chat_id}
  // =======================================================

  async deleteConversation(chat_id) {

    if (!chat_id) {

      throw new Error(
        "chat_id is required."
      );

    }


    return request(
      `/conversations/${encodeURIComponent(chat_id)}`,
      {
        method: "DELETE",
      }
    );
  },

};