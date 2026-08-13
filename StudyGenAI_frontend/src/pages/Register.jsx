import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { User, Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Confirm password must match password.');
      return;
    }

    setLoading(true);

    try {
      // Call register API which receives access_token
      await register(name.trim(), email.trim(), password);
      setSuccess(true);

      // Automatically transition to workspace without requiring user to login again
      setTimeout(() => {
        navigate('/workspace');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.isNetworkError) {
        setError('Backend server offline. Please check http://127.0.0.1:8000');
      } else {
        setError(err.message || 'Registration failed. Email may already be in use.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pt-20">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Large Centered Glassmorphism Box */}
          <div className="glass-box p-8 sm:p-10 shadow-2xl relative border-white/90">
            <div className="text-center mb-6">
              <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                Create your account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Join StudyGen AI for intelligent document learning
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="py-6 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-emerald-800">
                  Registration successful
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  A confirmation email has been sent to your email address.
                </p>
                <p className="text-xs text-indigo-600 font-semibold pt-2">
                  Entering workspace automatically...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sreenivas"
                    required
                    className="input-glass"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="input-glass"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-glass"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-glass"
                  />
                </div>

                {/* Subtle Light Greenish-White Glassy Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-signup-glass w-full py-2.5 mt-2 font-semibold text-sm justify-center"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center pt-4 border-t border-slate-200/60">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        StudyGen AI Auth Security
      </footer>
    </div>
  );
};
