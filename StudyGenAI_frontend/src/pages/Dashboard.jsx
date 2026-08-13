import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadBox } from '../components/UploadBox';
import { DocumentCard } from '../components/DocumentCard';
import { BookOpen, FolderOpen, Sparkles, Plus } from 'lucide-react';

export const Dashboard = () => {
  const { user, documents, removeDocument } = useAuth();
  const navigate = useNavigate();

  const handleUploadSuccess = (docData) => {
    // Navigate immediately to document chat page using returned document_id
    if (docData?.document_id) {
      navigate(`/document/${docData.document_id}`, {
        state: { filename: docData.filename }
      });
    }
  };

  return (
    <div className="py-8 px-4 container mx-auto max-w-6xl space-y-10">
      {/* Workspace Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Welcome, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload study material or pick a document to start asking questions & generating quizzes.
          </p>
        </div>
      </div>

      {/* Primary Section: Drag-and-drop PDF Upload Area */}
      <section className="space-y-3">
        <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Upload New Document</span>
        </h2>
        <UploadBox onUploadSuccess={handleUploadSuccess} />
      </section>

      {/* Secondary Section: My Documents List */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <span>My Documents</span>
            {documents.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {documents.length}
              </span>
            )}
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="glass-panel p-10 text-center border-dashed border-white/10 my-4">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-slate-300 text-base">No documents uploaded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Upload a PDF above to create your first AI study document.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.document_id}
                document={doc}
                onDelete={removeDocument}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
