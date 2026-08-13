import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UploadBox = ({ onUploadSuccess }) => {
  const { addDocument } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelection = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Only PDF files are supported. Please select a valid PDF document.');
      return;
    }

    // Reset state
    setError(null);
    setUploadResult(null);
    setUploading(true);

    try {
      // Call real backend POST /upload
      const res = await api.uploadDocument(file);
      
      // Expected backend response:
      // { message, document_id, filename, characters, chunks }
      if (!res.document_id) {
        throw new Error('Backend response did not contain document_id');
      }

      const docData = {
        document_id: res.document_id,
        filename: res.filename || file.name,
        characters: res.characters || 0,
        chunks: res.chunks || 1,
      };

      // Store in auth context history
      addDocument(docData);
      setUploadResult(docData);

      if (onUploadSuccess) {
        onUploadSuccess(docData);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      // Fallback for demonstration if user is testing offline without backend running yet
      if (err.isNetworkError) {
        setError('Backend server offline. Please ensure FastAPI is running at http://127.0.0.1:8000');
      } else {
        setError(err.message || 'Failed to upload document. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-white/15 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-indigo-400 spin-icon" />
              </div>
              <div>
                <p className="font-heading font-semibold text-white text-lg">Uploading PDF...</p>
                <p className="text-xs text-slate-400 mt-1">Extracting document text and creating embeddings</p>
              </div>
            </div>
          ) : uploadResult ? (
            <div className="flex flex-col items-center py-2 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="font-heading font-bold text-white text-lg">{uploadResult.filename}</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-2">
                  <span>Processed successfully</span>
                  <span>•</span>
                  <span>{uploadResult.characters} characters</span>
                  <span>•</span>
                  <span>{uploadResult.chunks} chunks</span>
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUploadSuccess) onUploadSuccess(uploadResult);
                }}
                className="btn btn-primary text-xs py-2 px-4 mt-2 gap-2"
              >
                <span>Start Studying</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
              </div>

              <div>
                <h3 className="font-heading font-bold text-white text-xl">Upload your study material</h3>
                <p className="text-sm text-slate-400 mt-1">PDF documents only (lecture notes, textbooks, research papers)</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  className="btn btn-secondary text-sm px-5 py-2.5 hover:border-indigo-400/50"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Choose PDF</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">Drag & drop your file anywhere in this box</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
