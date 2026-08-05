import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuLock, LuRefreshCw, LuArrowRight, LuShieldCheck } from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

export default function ResetPassword(): React.JSX.Element {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    if (password.length < 8) {
      showToast('Validation Error', 'Password must be at least 8 characters long.', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showToast('Validation Error', 'Passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      // Ensure we hit the endpoint expecting the token as a URL param
      const res = await fetch(`${BASE_URL}/api/v1/auth/reset-password/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important to save the JWT cookie your backend creates
        body: JSON.stringify({ password, confirmPassword:passwordConfirm}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Token is invalid or has expired');
      }

      setSuccess(true);
      showToast('Success', 'Your password has been successfully reset.', 'success');
      
      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        navigate('/me');
      }, 2000);
      
    } catch (err: any) {
      showToast('Reset Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col justify-center items-center font-sans relative selection:bg-blue-600 selection:text-white px-4">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-b from-emerald-600/20 via-teal-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 mb-4">
            <LuLock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New Password</h1>
          <p className="text-slate-400 text-sm mt-2 font-mono">
            Please enter your new strong password below.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-6 py-4">
              <LuShieldCheck className="w-16 h-16 text-emerald-400 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Password Updated</h3>
                <p className="text-sm text-slate-400">
                  Your password has been reset successfully.
                </p>
              </div>
              <button
                onClick={() => navigate('/me')}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <LuArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2 font-mono">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <LuLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-700 focus:border-emerald-500 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2 font-mono">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <LuLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-700 focus:border-emerald-500 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Updating...' : 'Reset Password'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}