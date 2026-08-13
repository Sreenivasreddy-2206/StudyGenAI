import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

import { Sidebar } from "../components/Sidebar";
import { AccountMenu } from "../components/AccountMenu";
import { ChatComposer } from "../components/ChatComposer";
import { UploadModal } from "../components/UploadModal";
import { Quiz } from "../components/Quiz";
import { Toast } from "../components/Toast";

import {
  Sparkles,
  FileText,
  Menu,
  HelpCircle,
  Bot,
  User,
  Copy,
  Check,
  Trash2,
  X,
} from "lucide-react";


// =========================================================
// WORKSPACE
// =========================================================

export const Workspace = () => {

  const {
    currentDocument,
    setCurrentDocument,
    token,
  } = useAuth();


  // =======================================================
  // CHAT MODE
  // =======================================================

  const [activeTab, setActiveTab] = useState("casual");
  // "casual" | "document"


  // =======================================================
  // CHAT HISTORIES
  // =======================================================

  const [chatHistories, setChatHistories] = useState({});


  // =======================================================
  // CONVERSATIONS LOADING
  // =======================================================

  const [isLoadingConversations, setIsLoadingConversations] =
    useState(true);


  // =======================================================
  // LOADING STATES
  // =======================================================

  const [isAsking, setIsAsking] = useState(false);

  const [isGeneratingQuiz, setIsGeneratingQuiz] =
    useState(false);


  // =======================================================
  // UI STATES
  // =======================================================

  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState(false);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);


  // =======================================================
  // CHAT DELETE CONFIRMATION
  // =======================================================

  const [showDeleteChatModal, setShowDeleteChatModal] =
    useState(false);


  // =======================================================
  // QUIZ
  // =======================================================

  const [quizData, setQuizData] = useState(null);

  const [isQuizActive, setIsQuizActive] =
    useState(false);


  // =======================================================
  // ERROR / COPY
  // =======================================================

  const [toastError, setToastError] =
    useState(null);

  const [copiedId, setCopiedId] =
    useState(null);


  // =======================================================
  // CHAT SCROLL
  // =======================================================

  const chatContainerRef = useRef(null);


  // =======================================================
  // CURRENT CHAT KEY
  // =======================================================

  const chatKey =
    activeTab === "document" && currentDocument
      ? `document:${currentDocument.document_id}`
      : "casual";


  // =======================================================
  // CURRENT MESSAGES
  // =======================================================

  const messages =
    chatHistories[chatKey] || [];


  // =======================================================
  // LOAD ALL SAVED CONVERSATIONS
  // =======================================================

  useEffect(() => {

    if (!token) {
      setChatHistories({});
      setIsLoadingConversations(false);
      return;
    }


    const loadConversations = async () => {

      setIsLoadingConversations(true);

      try {

        const response =
          await api.getConversations();

        const conversations =
          response?.conversations || [];

        const historyMap = {};


        // ---------------------------------------------------
        // Convert MongoDB conversations into frontend format
        // ---------------------------------------------------

        conversations.forEach((conversation) => {

          const conversationKey =
            conversation.chat_id;

          const savedMessages =
            Array.isArray(conversation.messages)
              ? conversation.messages
              : [];


          historyMap[conversationKey] =
            savedMessages.map(
              (message, index) => ({
                id:
                  message.id ||
                  `${conversationKey}-${index}-${message.sender}-${Date.now()}`,

                sender:
                  message.sender,

                content:
                  message.content,
              })
            );

        });


        setChatHistories(historyMap);

      } catch (error) {

        console.error(
          "Failed to load conversations:",
          error
        );

        setToastError(
          error.message ||
          "Failed to load saved conversations."
        );

      } finally {

        setIsLoadingConversations(false);

      }

    };


    loadConversations();

  }, [token]);


  // =======================================================
  // INITIALIZE CURRENT CHAT
  //
  // IMPORTANT:
  // Only create welcome message when the chat does not
  // already exist in MongoDB.
  // =======================================================

  useEffect(() => {

    if (
      isLoadingConversations ||
      !token
    ) {
      return;
    }


    setChatHistories((previousHistories) => {

      // ---------------------------------------------------
      // Conversation already exists
      // ---------------------------------------------------

      if (
        Object.prototype.hasOwnProperty.call(
          previousHistories,
          chatKey
        )
      ) {

        return previousHistories;

      }


      // ---------------------------------------------------
      // Create welcome message
      // ---------------------------------------------------

      let welcomeMessage;


      // ---------------------------------------------------
      // PDF CHAT
      // ---------------------------------------------------

      if (
        activeTab === "document" &&
        currentDocument
      ) {

        welcomeMessage = {

          id:
            `welcome-${currentDocument.document_id}`,

          sender: "ai",

          content:
            `Currently studying: ${currentDocument.filename}. ` +
            `Ask any question about this document`

        };

      }


      // ---------------------------------------------------
      // CASUAL CHAT
      // ---------------------------------------------------

      else {

        welcomeMessage = {

          id: "casual-welcome",

          sender: "ai",

          content:
            'Hello! I am your AI study assistant. ' +
            'Ask me general questions or click "Upload" below ' +
            'to study your PDF documents.',

        };

      }


      // ---------------------------------------------------
      // Store welcome message locally
      //
      // IMPORTANT:
      // We DON'T save this welcome message to MongoDB.
      // It is only a UI message until the user actually chats.
      // ---------------------------------------------------

      return {

        ...previousHistories,

        [chatKey]: [
          welcomeMessage,
        ],

      };

    });

  }, [
    chatKey,
    activeTab,
    currentDocument,
    isLoadingConversations,
    token,
  ]);


  // =======================================================
  // SCROLL TO BOTTOM
  // =======================================================

  useEffect(() => {

    if (chatContainerRef.current) {

      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;

    }

  }, [
    messages,
    isAsking,
  ]);


  // =======================================================
  // ADD MESSAGE TO CURRENT CHAT
  // =======================================================

  const addMessageToChat = (
    conversationKey,
    message
  ) => {

    setChatHistories((previousHistories) => {

      const existingMessages =
        previousHistories[conversationKey] || [];


      return {

        ...previousHistories,

        [conversationKey]: [
          ...existingMessages,
          message,
        ],

      };

    });

  };


  // =======================================================
  // SAVE MESSAGE TO MONGODB
  // =======================================================

  const saveMessageToBackend = async (
    conversationKey,
    message
  ) => {

    try {

      await api.saveMessage({

        chat_id:
          conversationKey,

        sender:
          message.sender,

        content:
          message.content,

      });

    } catch (error) {

      console.error(
        "Failed to save message:",
        error
      );

      // Don't break the chat if persistence fails.
      setToastError(
        "Message generated, but it could not be saved."
      );

    }

  };


  // =======================================================
  // ADD + SAVE MESSAGE
  // =======================================================

  const addAndSaveMessage = async (
    conversationKey,
    message
  ) => {

    // -----------------------------------------------------
    // Add immediately to UI
    // -----------------------------------------------------

    addMessageToChat(
      conversationKey,
      message
    );


    // -----------------------------------------------------
    // Save to MongoDB
    // -----------------------------------------------------

    await saveMessageToBackend(
      conversationKey,
      message
    );

  };


  // =======================================================
  // DELETE CURRENT CHAT
  // =======================================================

  const deleteCurrentChat = async () => {

    try {

      // ---------------------------------------------------
      // Delete from MongoDB
      // ---------------------------------------------------

      await api.deleteConversation(
        chatKey
      );


      // ---------------------------------------------------
      // Delete from React state
      // ---------------------------------------------------

      setChatHistories(
        (previousHistories) => {

          const updatedHistories = {
            ...previousHistories,
          };

          delete updatedHistories[chatKey];

          return updatedHistories;

        }
      );


      setShowDeleteChatModal(false);

      setToastError(null);

    } catch (error) {

      console.error(
        "Failed to delete conversation:",
        error
      );

      setToastError(
        error.message ||
        "Failed to clear conversation."
      );

    }

  };


  // =======================================================
  // ASK QUERY
  // =======================================================

  const handleSendQuery = async (queryText) => {

    if (
      !queryText.trim() ||
      isAsking
    ) {

      return;

    }


    // -----------------------------------------------------
    // Capture current conversation
    // -----------------------------------------------------

    const conversationKey =
      chatKey;


    // -----------------------------------------------------
    // Capture document ID
    // -----------------------------------------------------

    const documentIdToSend =
      activeTab === "document" &&
      currentDocument
        ? currentDocument.document_id
        : null;


    // -----------------------------------------------------
    // USER MESSAGE
    // -----------------------------------------------------

    const userMsg = {

      id:
        `user-${Date.now()}`,

      sender:
        "user",

      content:
        queryText,

    };


    // -----------------------------------------------------
    // Add + persist user message
    // -----------------------------------------------------

    await addAndSaveMessage(
      conversationKey,
      userMsg
    );


    setIsAsking(true);

    setToastError(null);


    try {

      // ===================================================
      // API REQUEST
      // ===================================================

      const response =
        await api.askQuestion({

          query:
            queryText,

          document_id:
            documentIdToSend,

        });


      // ===================================================
      // EXTRACT RESPONSE
      // ===================================================

      const aiText =
        response.content ||
        response.answer ||
        (
          typeof response === "string"
            ? response
            : JSON.stringify(response)
        );


      // ===================================================
      // AI MESSAGE
      // ===================================================

      const aiMsg = {

        id:
          `ai-${Date.now()}`,

        sender:
          "ai",

        content:
          aiText,

      };


      // ===================================================
      // ADD + PERSIST AI MESSAGE
      // ===================================================

      await addAndSaveMessage(
        conversationKey,
        aiMsg
      );

    }


    // =====================================================
    // ERROR
    // =====================================================

    catch (err) {

      console.error(
        "Ask error:",
        err
      );


      let message =
        "Failed to generate response.";


      if (err.isNetworkError) {

        message =
          "Backend server offline. Ensure FastAPI is running at http://127.0.0.1:8000";

      }

      else if (err.message) {

        message =
          err.message;

      }


      setToastError(
        message
      );


      // ---------------------------------------------------
      // Show error in UI
      // ---------------------------------------------------

      const errorMessage = {

        id:
          `err-${Date.now()}`,

        sender:
          "ai",

        content:
          `⚠️ Error: ${message}`,

      };


      addMessageToChat(
        conversationKey,
        errorMessage
      );

    }


    finally {

      setIsAsking(false);

    }

  };


  // =======================================================
  // GENERATE QUIZ
  // =======================================================

  const handleGenerateQuiz = async () => {

    if (
      !currentDocument?.document_id ||
      isGeneratingQuiz
    ) {

      return;

    }


    setIsGeneratingQuiz(true);

    setToastError(null);


    try {

      const response =
        await api.generateQuiz({

          query:
            "Generate 10 MCQs",

          document_id:
            currentDocument.document_id,

        });


      setQuizData(
        response
      );

      setIsQuizActive(
        true
      );

    }


    catch (err) {

      console.error(
        "Generate quiz error:",
        err
      );


      setToastError(
        err.message ||
        "Failed to generate quiz questions."
      );

    }


    finally {

      setIsGeneratingQuiz(false);

    }

  };


  // =======================================================
  // COPY MESSAGE
  // =======================================================
const copyText = async (text) => {
  if (!text) return;

  const textToCopy = String(text);

  try {
    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);

      console.log("Copied using Clipboard API");
      return;
    }

    // Fallback for HTTP / non-secure context
    const textarea = document.createElement("textarea");

    textarea.value = textToCopy;

    // Make it actually focusable/selectable
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.padding = "0";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    // Important for some browsers
    textarea.setSelectionRange(
      0,
      textarea.value.length
    );

    const successful = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (!successful) {
      throw new Error("Fallback copy command failed");
    }

    console.log("Copied successfully using fallback");

  } catch (error) {
    console.error("Copy failed:", error);
  }
};

  // =======================================================
  // DOCUMENT MODE
  // =======================================================

  const isDocumentMode =
    activeTab === "document" &&
    currentDocument;


  // =======================================================
  // CHAT INPUT PLACEHOLDER
  // =======================================================

  const placeholderText =
    isDocumentMode
      ? `Ask anything about ${currentDocument.filename}...`
      : "Ask anything...";


  // =======================================================
  // UI
  // =======================================================

  return (

    <div className="h-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden">


      {/* ===================================================
          TOAST
      =================================================== */}

      <Toast
        type="error"
        message={toastError}
        onClose={() =>
          setToastError(null)
        }
      />


      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header className="h-14 bg-white/70 backdrop-blur-md border-b border-slate-200/70 px-4 flex items-center justify-between shrink-0 z-30 shadow-sm">


        {/* =================================================
            LEFT
        ================================================= */}

        <div className="flex items-center gap-3">


          {/* MOBILE SIDEBAR */}

          <button
            onClick={() =>
              setIsSidebarOpen(
                !isSidebarOpen
              )
            }
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >

            <Menu className="w-5 h-5" />

          </button>


          {/* LOGO */}

          <div className="flex items-center gap-2">

            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">

              <Sparkles className="w-3.5 h-3.5" />

            </div>


            <span className="font-heading font-extrabold text-base text-slate-900 tracking-tight">

              StudyGen{" "}

              <span className="text-indigo-600">
                AI
              </span>

            </span>

          </div>


          {/* CURRENT CHAT */}

          <div className="hidden sm:flex items-center gap-2">


            {isDocumentMode ? (

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">

                <FileText className="w-3.5 h-3.5 text-indigo-600" />

                <span>

                  Currently studying:{" "}

                  {currentDocument.filename}

                </span>

              </div>

            ) : (

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">

                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />

                <span>
                  Casual Chat
                </span>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="flex items-center gap-2">


          {/* =================================================
              CLEAR CHAT
          ================================================= */}

          <button
            onClick={() =>
              setShowDeleteChatModal(true)
            }
            className="
              flex items-center gap-1.5
              px-2.5 py-1.5
              rounded-full
              text-xs font-semibold
              text-red-600
              bg-red-50/80
              border border-red-200/70
              hover:bg-red-100
              hover:border-red-300
              transition-all
            "
            title="Clear current chat"
          >

            <Trash2 className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              Clear Chat
            </span>

          </button>


          {/* =================================================
              QUIZ BUTTON
          ================================================= */}

      

          {/* ACCOUNT */}

          <AccountMenu />

        </div>

      </header>


      {/* ===================================================
          MAIN BODY
      =================================================== */}

      <div className="flex-1 flex overflow-hidden relative">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUploadModal={() =>
            setIsUploadModalOpen(true)
          }
          isOpen={isSidebarOpen}
          onClose={() =>
            setIsSidebarOpen(false)
          }
        />


        {/* =================================================
            CHAT AREA
        ================================================= */}

        <main className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] relative">


          {/* =================================================
              QUIZ
          ================================================= */}

          {isQuizActive && quizData ? (

            <div className="flex-1 overflow-y-auto p-4">

              <Quiz
                quizData={quizData}

                onBack={() =>
                  setIsQuizActive(false)
                }

                onRetry={
                  handleGenerateQuiz
                }
              />

            </div>

          ) : (

            <>


              {/* =============================================
                  MOBILE DOCUMENT BANNER
              ============================================= */}

              {isDocumentMode && (

                <div className="sm:hidden bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 flex items-center justify-between text-xs font-semibold text-indigo-800">

                  <div className="flex items-center gap-1.5 truncate">

                    <FileText className="w-3.5 h-3.5 shrink-0 text-indigo-600" />

                    <span className="truncate">

                      Studying:{" "}

                      {currentDocument.filename}

                    </span>

                  </div>


                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="text-[11px] text-indigo-700 underline shrink-0 font-bold"
                  >

                    MCQs

                  </button>

                </div>

              )}


              {/* =============================================
                  CHAT MESSAGES
              ============================================= */}

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full"
              >


                {/* ===========================================
                    LOADING SAVED CONVERSATIONS
                =========================================== */}

                {isLoadingConversations && (

                  <div className="flex items-center justify-center py-10">

                    <div className="flex items-center gap-2 text-xs text-slate-500">

                      <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />

                      Loading your conversations...

                    </div>

                  </div>

                )}


                {/* ===========================================
                    MESSAGE LIST
                =========================================== */}

                {!isLoadingConversations &&
                  messages.map((message) => {

                    const isUser =
                      message.sender === "user";


                    return (

                      <div
                        key={message.id}
                        className={`flex items-start gap-3 animate-fade-in ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >


                        {/* =====================================
                            AI AVATAR
                        ===================================== */}

                        {!isUser && (

                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">

                            <Bot className="w-4 h-4" />

                          </div>

                        )}


                        {/* =====================================
                            MESSAGE BOX
                        ===================================== */}

                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[78%] text-sm leading-relaxed ${
                            isUser
                              ? "bg-indigo-600 text-white shadow-sm rounded-tr-none"
                              : "glass-panel bg-white/90 text-slate-800 border-slate-200/80 rounded-tl-none shadow-sm"
                          }`}
                        >


                          {/* =================================
                              MESSAGE HEADER
                          ================================= */}

                          <div className="flex items-center justify-between gap-2 mb-1">


                            <span
                              className={`text-[11px] font-bold ${
                                isUser
                                  ? "text-indigo-100"
                                  : "text-slate-400"
                              }`}
                            >

                              {isUser
                                ? "You"
                                : "StudyGen AI"}

                            </span>


                            {/* COPY */}

                            {!isUser && (

                              <button
                                onClick={() =>
                                  copyText(
                                    message.id,
                                    message.content
                                  )
                                }
                                className="p-1 rounded text-slate-400 hover:text-slate-600"
                                title="Copy response"
                              >

                                {copiedId === message.id ? (

                                  <Check className="w-3.5 h-3.5 text-emerald-600" />

                                ) : (

                                  <Copy className="w-3.5 h-3.5" />

                                )}

                              </button>

                            )}

                          </div>


                          {/* =================================
                              MESSAGE CONTENT
                          ================================= */}

                          <div
                            className={`
                              text-sm
                              leading-7
                              font-sans

                              ${
                                isUser
                                  ? "text-white"
                                  : "text-slate-800"
                              }

                              [&>p]:mb-3
                              [&>p:last-child]:mb-0

                              [&>h1]:text-xl
                              [&>h1]:font-bold
                              [&>h1]:text-slate-900
                              [&>h1]:mt-4
                              [&>h1]:mb-3

                              [&>h2]:text-lg
                              [&>h2]:font-bold
                              [&>h2]:text-slate-900
                              [&>h2]:mt-4
                              [&>h2]:mb-2

                              [&>h3]:text-base
                              [&>h3]:font-bold
                              [&>h3]:text-slate-900
                              [&>h3]:mt-3
                              [&>h3]:mb-2

                              [&>ul]:list-disc
                              [&>ul]:pl-6
                              [&>ul]:mb-3

                              [&>ol]:list-decimal
                              [&>ol]:pl-6
                              [&>ol]:mb-3

                              [&>li]:mb-1

                              [&_strong]:font-bold
                              [&_strong]:text-slate-900

                              [&_em]:italic

                              [&_code]:bg-slate-100
                              [&_code]:text-indigo-700
                              [&_code]:px-1.5
                              [&_code]:py-0.5
                              [&_code]:rounded
                              [&_code]:font-mono
                              [&_code]:text-[13px]

                              [&>blockquote]:border-l-4
                              [&>blockquote]:border-indigo-400
                              [&>blockquote]:pl-4
                              [&>blockquote]:italic
                              [&>blockquote]:text-slate-500
                            `}
                          >

                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                            >
                              {message.content}
                            </ReactMarkdown>

                          </div>

                        </div>


                        {/* =====================================
                            USER AVATAR
                        ===================================== */}

                        {isUser && (

                          <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">

                            <User className="w-4 h-4" />

                          </div>

                        )}

                      </div>

                    );

                  })}


                {/* ===========================================
                    THINKING
                =========================================== */}

                {isAsking && (

                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-3 glass-panel max-w-xs bg-white/80">

                    <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />

                    <span>
                      StudyGen AI is thinking...
                    </span>

                  </div>

                )}

              </div>


              {/* =============================================
                  CHAT COMPOSER
              ============================================= */}

              <ChatComposer
                onSend={handleSendQuery}
                onOpenUpload={() =>
                  setIsUploadModalOpen(true)
                }
                placeholder={placeholderText}
                disabled={isAsking}
              />

            </>

          )}

        </main>

      </div>


      {/* ===================================================
          UPLOAD MODAL
      =================================================== */}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() =>
          setIsUploadModalOpen(false)
        }
      />


      {/* ===================================================
          CLEAR CHAT CONFIRMATION
      =================================================== */}

      {showDeleteChatModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">


          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() =>
              setShowDeleteChatModal(false)
            }
          />


          {/* MODAL */}

          <div className="relative w-full max-w-sm glass-box p-6 animate-fade-in">


            {/* CLOSE */}

            <button
              onClick={() =>
                setShowDeleteChatModal(false)
              }
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >

              <X className="w-4 h-4" />

            </button>


            {/* ICON */}

            <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">

              <Trash2 className="w-5 h-5 text-red-500" />

            </div>


            {/* TITLE */}

            <h2 className="text-lg font-bold text-slate-900">

              Clear this conversation?

            </h2>


            {/* DESCRIPTION */}

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">

              This will remove the current chat history.
              Your uploaded PDF will not be deleted.

            </p>


            {/* CURRENT CHAT */}

            <div className="mt-4 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">

              <span className="font-semibold text-slate-800">
                Chat:
              </span>{" "}

              {isDocumentMode
                ? currentDocument.filename
                : "Casual Chat"}

            </div>


            {/* BUTTONS */}

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() =>
                  setShowDeleteChatModal(false)
                }
                className="btn-glass"
              >

                Cancel

              </button>


              <button
                onClick={deleteCurrentChat}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  text-red-700
                  bg-red-50
                  border
                  border-red-200
                  hover:bg-red-100
                  hover:border-red-300
                  transition
                "
              >

                <Trash2 className="w-4 h-4" />

                Clear Chat

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};