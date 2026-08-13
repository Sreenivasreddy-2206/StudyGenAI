import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, BookOpen, Clock, Trash2 } from 'lucide-react';

export const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/document/${document.document_id}`, {
      state: { filename: document.filename }
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently uploaded';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card p-5 flex flex-col justify-between h-full group hover:border-indigo-500/40 relative">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>

          <span className="badge badge-emerald text-[11px]">Ready to study</span>
        </div>

        <h4 className="font-heading font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {document.filename}
        </h4>

        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
          {document.characters ? (
            <span>{document.characters.toLocaleString()} chars</span>
          ) : null}
          {document.chunks ? (
            <>
              <span>•</span>
              <span>{document.chunks} chunks</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(document.uploadedAt)}
        </span>

        <div className="flex items-center gap-1.5">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.document_id);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Remove document"
              aria-label="Remove document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleOpen}
            className="btn btn-secondary text-xs px-3 py-1.5 gap-1.5 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
