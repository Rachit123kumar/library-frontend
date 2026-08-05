import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuMail, LuArrowLeft, LuCheck, LuRefreshCw } from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

export default function ForgotPassword(): React.JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          method: 'GET',
          
       credentials: 'include',
          
          // IMPORTANT: If you use localStorage for JWT tokens, uncomment the headers:
      
          headers: {
           
            'Content-Type': 'application/json'
          }
         
        });

        if (res.ok) {
          const data = await res.json();
          // If the API returns a user object, they are logged in
          if (data.user) {
            navigate('/me');
          }
        }
      } catch (err) {
        // We can silently ignore errors here; it just means the user isn't logged in
        console.error('User is not authenticated:', err);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    if (type === 'success') toast.success(content, { autoClose: 4000 });
    else toast.error(content, { autoClose: 4000 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Validation Error', 'Please enter your email address.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setIsSubmitted(true);
      showToast('Success', 'Password reset link sent to your email.', 'success');
    } catch (err: any) {
      showToast('Request Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col justify-center items-center font-sans relative selection:bg-blue-600 selection:text-white px-4">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20 mb-4">
            <LuMail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-2 font-mono">
            Enter your email to receive a reset link.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center space-y-6 py-4">
              <LuCheck className="w-16 h-16 text-emerald-400 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Check your email</h3>
                <p className="text-sm text-slate-400">
                  We sent a password reset link to <br />
                  <span className="font-bold text-white">{email}</span>
                </p>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                The link will expire in 10 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <LuMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-mono"
          >
            <LuArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}