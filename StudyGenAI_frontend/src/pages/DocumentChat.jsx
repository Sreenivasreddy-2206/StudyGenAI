import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { QuickActions } from '../components/QuickActions';
import { Quiz } from '../components/Quiz';
import { ThinkingPulse } from '../components/Loading';
import { Toast } from '../components/Toast';
import { ArrowLeft, FileText, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export const DocumentChat = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { documents } = useAuth();

  // Find document metadata if available in history
  const matchedDoc = documents.find((d) => d.document_id === documentId);
  const filename = location.state?.filename || matchedDoc?.filename || 'Document Workspace';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      content: `Hello! I'm your AI study assistant for ${filename}. Ask me any question, ask for key takeaways, or click "Generate MCQs" above to start a practice quiz!`,
      timestamp: new Date(),
    },
  ]);

  const [isAsking, setIsAsking] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [toastError, setToastError] = useState(null);

  const chatContainerRef = useRef(null);

  // Scroll chat thread to bottom on message updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAsking]);

  // Handle Ask Question (POST /ask)
  const handleSendQuery = async (queryText) => {
    if (!queryText.trim() || isAsking || !documentId) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);
    setToastError(null);

    try {
      // Call real backend POST /ask with STRICT document_id parameter
      const response = await api.askQuestion({
        query: queryText,
        document_id: documentId,
      });

      // Expected backend response: { type: "answer", content: "...", document_id: "..." }
      const aiContent = response.content || response.answer || (typeof response === 'string' ? response : JSON.stringify(response));

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Ask Question error:', err);
      let errMsg = 'Something went wrong while generating your answer.';
      if (err.isNetworkError) {
        errMsg = 'Unable to reach backend server. Please ensure FastAPI is running at http://127.0.0.1:8000';
      } else if (err.status === 404) {
        errMsg = 'Document context not found on server. Please try re-uploading.';
      } else if (err.message) {
        errMsg = err.message;
      }

      setToastError(errMsg);
      
      // Append error notification in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          content: `⚠️ Error: ${errMsg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Handle Generate Quiz (POST /generate-quiz)
  const handleGenerateQuiz = async () => {
    if (isGeneratingQuiz || !documentId) return;

    setIsGeneratingQuiz(true);
    setToastError(null);

    try {
      // Call real backend POST /generate-quiz
      const res = await api.generateQuiz({
        query: 'Generate 10 MCQs',
        document_id: documentId,
      });

      // Expected backend response: { type: "quiz", data: { questions: [...] }, document_id: "..." }
      setQuizData(res);
      setIsQuizActive(true);
    } catch (err) {
      console.error('Generate Quiz error:', err);
      let errMsg = 'Failed to generate quiz questions.';
      if (err.isNetworkError) {
        errMsg = 'Unable to reach backend server. Please check your FastAPI server.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setToastError(errMsg);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <Toast type="error" message={toastError} onClose={() => setToastError(null)} />

      {/* Top Document Workspace Header */}
      <div className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/10 sticky top-16 z-30 py-3 px-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-ghost text-xs text-slate-400 hover:text-white px-2.5 py-1.5 shrink-0"
              title="Back to Documents"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Documents</span>
            </button>

            <div className="h-4 w-px bg-white/10 shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="font-heading font-bold text-white text-sm sm:text-base truncate">
                {filename}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden md:inline truncate max-w-[180px]">
            ID: {documentId?.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="container mx-auto max-w-4xl px-4 flex-1 flex flex-col py-4">
        {isQuizActive && quizData ? (
          <Quiz
            quizData={quizData}
            onBack={() => setIsQuizActive(false)}
            onRetry={handleGenerateQuiz}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Quick Actions Bar */}
            <div className="sticky top-[7.5rem] z-20 bg-[#090d16]/80 backdrop-blur-sm py-1">
              <QuickActions
                onGenerateQuiz={handleGenerateQuiz}
                onQuickPrompt={handleSendQuery}
                disabled={isAsking || isGeneratingQuiz}
              />
            </div>

            {/* Chat Thread */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[350px] max-h-[calc(100vh-20rem)]"
            >
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isAsking && <ThinkingPulse message="AI is reading document & thinking..." />}
              {isGeneratingQuiz && <ThinkingPulse message="Generating MCQs from document..." />}
            </div>

            {/* Sticky Chat Input Footer */}
            <div className="pt-2 sticky bottom-4">
              <ChatInput onSend={handleSendQuery} disabled={isAsking || isGeneratingQuiz} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
