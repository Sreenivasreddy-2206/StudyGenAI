import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="w-full py-4 px-6 fixed top-0 left-0 z-40 backdrop-blur-md bg-white/40 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Name */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900">
            StudyGen <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link to="/workspace" className="btn-glass text-xs font-semibold px-4 py-2">
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-glass text-xs font-medium px-4 py-1.5">
                Login
              </Link>
              <Link to="/register" className="btn-signup-glass text-xs font-semibold px-4 py-1.5">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
