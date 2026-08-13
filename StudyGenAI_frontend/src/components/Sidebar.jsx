import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Folder, FileText, Trash2, X, Plus } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenUploadModal, isOpen, onClose }) => {
  const { documents, currentDocument, setCurrentDocument, removeDocument } = useAuth();
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await removeDocument(docToDelete.document_id);
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  const handleSelectDoc = (doc) => {
    setCurrentDocument(doc);
    setActiveTab('document');
    if (onClose) onClose();
  };

  const handleCasualChatClick = () => {
    setCurrentDocument(null);
    setActiveTab('casual');
    if (onClose) onClose();
  };

  return (
    <>
      <aside className={`w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 flex flex-col justify-between h-full transition-all ${
        isOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Sidebar Navigation Header */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Navigation
            </p>

            <button
              onClick={handleCasualChatClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'casual' && !currentDocument
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/50'
                  : 'text-slate-700 hover:bg-slate-100/70'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Casual Chat</span>
            </button>
          </div>

          {/* Your Uploads Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200/50">
            <div className="flex items-center justify-between px-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Your Uploads
              </p>
              <button
                onClick={onOpenUploadModal}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                title="Upload PDF"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-slate-400 italic">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {documents.map((doc) => {
                  const isSelected = currentDocument?.document_id === doc.document_id;
                  return (
                    <div
                      key={doc.document_id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-50/80 text-indigo-800 font-semibold border border-indigo-200/60 shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{doc.filename}</span>
                      </div>

                      {/* Small subtle delete icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                        title="Delete document"
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-box p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between">
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Delete {docToDelete.filename}?
              </h3>
              <button
                onClick={() => setDocToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This document and its stored study data will be removed permanently from the server.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="btn-glass text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn-logout-glass text-xs py-1.5 px-3"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
