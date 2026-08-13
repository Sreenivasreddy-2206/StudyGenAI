import React, { useState, useRef } from 'react';
import { Send, Upload, Sparkles } from 'lucide-react';

export const ChatComposer = ({ onSend, onOpenUpload, placeholder = 'Ask anything...', disabled }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || disabled) return;
    onSend(query.trim());
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel p-2 flex items-center gap-2 border-slate-200/80 shadow-lg bg-white/80 backdrop-blur-xl rounded-full focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          {/* Sparkles icon */}
          <div className="pl-3 text-indigo-500 shrink-0">
            <Sparkles className="w-4 h-4 opacity-80" />
          </div>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm py-1.5 px-1 resize-none outline-none max-h-32 leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!query.trim() || disabled}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition shrink-0 shadow-sm"
            title="Send query"
            aria-label="Send query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          {/* Upload Button sitting beside composer */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="btn-glass text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 text-slate-700 bg-white/90 border-slate-200/90 shrink-0 hover:border-indigo-300 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload</span>
          </button>
        </div>
      </form>
    </div>
  );
};
