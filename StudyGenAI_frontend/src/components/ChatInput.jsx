import React, { useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

export const ChatInput = ({ onSend, disabled }) => {
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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative glass-panel p-2 flex items-end gap-2 border-white/10 focus-within:border-indigo-500/50 transition-colors shadow-2xl">
        <div className="pl-3 pb-2 text-indigo-400">
          <Sparkles className="w-4 h-4 opacity-70" />
        </div>

        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this document..."
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm py-2 px-1 resize-none outline-none max-h-36 leading-relaxed"
        />

        <button
          type="submit"
          disabled={!query.trim() || disabled}
          className="btn btn-primary p-2.5 rounded-xl shrink-0 transition-all disabled:opacity-40 disabled:hover:scale-100"
          title="Send query"
          aria-label="Send query"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
      <p className="text-[11px] text-center text-slate-500 mt-2">
        Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </form>
  );
};
