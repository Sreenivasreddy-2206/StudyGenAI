import React, { useState } from "react";
import { Sparkles, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatMessage = ({ message }) => {

  const isUser = message.sender === "user";

  const [copied, setCopied] = useState(false);


  // =========================================================
  // COPY MESSAGE
  // =========================================================

  const handleCopy = async () => {

    if (!message.content) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        String(message.content)
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {

      console.error(
        "Failed to copy message:",
        error
      );

      // -----------------------------------------------------
      // Fallback for browsers where clipboard API fails
      // -----------------------------------------------------

      try {

        const textarea =
          document.createElement("textarea");

        textarea.value = String(message.content);

        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);

      } catch (fallbackError) {

        console.error(
          "Clipboard fallback failed:",
          fallbackError
        );

      }
    }
  };


  return (

    <div
      className={`py-4 px-4 sm:px-6 rounded-2xl transition-all ${
        isUser
          ? "bg-white/[0.03] border border-white/[0.05] ml-auto max-w-[85%] sm:max-w-[75%]"
          : "bg-indigo-950/20 border border-indigo-500/15 mr-auto max-w-[95%] sm:max-w-[85%]"
      }`}
    >

      <div className="flex items-start gap-3">

        {/* =================================================
            AVATAR
        ================================================= */}

        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
            isUser
              ? "bg-slate-800 text-slate-300 border border-slate-700"
              : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
          }`}
        >

          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}

        </div>


        {/* =================================================
            MESSAGE CONTENT
        ================================================= */}

        <div className="flex-1 min-w-0">

          {/* Header */}

          <div className="flex items-center justify-between gap-2 mb-2">

            <span className="text-xs font-semibold text-slate-400">
              {isUser ? "You" : "StudyGen AI"}
            </span>


            {/* COPY BUTTON */}

            {!isUser && (

              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
                title={copied ? "Copied!" : "Copy text"}
              >

                {copied ? (

                  <Check className="w-4 h-4 text-emerald-400" />

                ) : (

                  <Copy className="w-4 h-4" />

                )}

              </button>

            )}

          </div>


          {/* =================================================
              MARKDOWN MESSAGE
          ================================================= */}

          <div className="font-sans text-sm text-slate-200 leading-relaxed">

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{

                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-slate-100 mt-4 mb-2">
                    {children}
                  </h2>
                ),

                h3: ({ children }) => (
                  <h3 className="text-base font-bold text-slate-100 mt-3 mb-1">
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">
                    {children}
                  </p>
                ),

                strong: ({ children }) => (
                  <strong className="font-bold text-slate-100">
                    {children}
                  </strong>
                ),

                ul: ({ children }) => (
                  <ul className="list-disc ml-5 mb-3 space-y-1">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="list-decimal ml-5 mb-3 space-y-1">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="pl-1">
                    {children}
                  </li>
                ),

                code: ({ children }) => (
                  <code className="bg-slate-800/70 px-1.5 py-0.5 rounded text-sm">
                    {children}
                  </code>
                ),

                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-indigo-400 pl-3 my-3 text-slate-400">
                    {children}
                  </blockquote>
                ),

              }}
            >
              {message.content}
            </ReactMarkdown>

          </div>

        </div>

      </div>

    </div>
  );
};