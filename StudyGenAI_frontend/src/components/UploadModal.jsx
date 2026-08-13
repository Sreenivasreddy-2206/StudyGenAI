import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { addDocument } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelection = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Call POST /upload
      const res = await api.uploadDocument(file);

      if (!res.document_id) {
        throw new Error('Backend response did not contain document_id');
      }

      const docData = {
        document_id: res.document_id,
        filename: res.filename || file.name,
        characters: res.characters || 0,
        chunks: res.chunks || 1,
      };

      // Add to AuthContext state & set as current selected document
      addDocument(docData);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setUploading(false);
        if (onUploadSuccess) onUploadSuccess(docData);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Upload error:', err);
      if (err.isNetworkError) {
        setError('Backend server offline. Please check http://127.0.0.1:8000');
      } else {
        setError(err.message || 'Failed to upload PDF. Please try again.');
      }
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-box p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <span>Upload PDF Study Material</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
          accept=".pdf,application/pdf"
          className="hidden"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300/80 bg-white/40 hover:border-indigo-400 hover:bg-white/60'
          }`}
        >
          {uploading ? (
            <div className="py-4 space-y-3">
              {success ? (
                <div className="flex flex-col items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  <p className="font-bold text-sm">Upload successful</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-indigo-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="font-semibold text-xs text-slate-600">Processing PDF document...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Drag & Drop your PDF here</p>
                <p className="text-xs text-slate-400 mt-0.5">or click to browse files</p>
              </div>
              <button
                type="button"
                className="btn-glass text-xs font-semibold px-4 py-1.5 bg-white shadow-sm"
              >
                Browse PDF
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
