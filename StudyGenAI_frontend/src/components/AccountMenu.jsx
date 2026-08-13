import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export const AccountMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Symbol */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300/80 border border-slate-300/60 flex items-center justify-center text-slate-700 font-semibold text-xs shadow-sm transition"
        title="Account menu"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {/* Glassmorphism Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 p-3 glass-box shadow-xl border border-slate-200/80 z-50 animate-fade-in space-y-3">
          <div className="px-2 py-1">
            <p className="text-xs text-slate-400 font-medium">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <button
              onClick={handleLogout}
              className="btn-logout-glass w-full justify-center text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
