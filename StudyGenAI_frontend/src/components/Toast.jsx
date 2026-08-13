import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const Toast = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 max-w-md ${
        isSuccess
          ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
          : 'bg-rose-950/80 border-rose-500/30 text-rose-200'
      }`}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      )}

      <p className="text-sm font-medium leading-tight flex-1">{message}</p>

      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
          aria-label="Close message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
