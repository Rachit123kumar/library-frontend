import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuBookOpen,
  LuCheckCheck,
  LuCircle,
  LuLoader,
  LuArrowRight,
  LuMail,
} from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface VerifyResponse {
  status: string;
  message: string;
  email?: string;
  id?: number;
  fullName?: string;
}

export default function VerifyEmailPage(): React.JSX.Element {
  const { EmailVerificationToken } = useParams<{ EmailVerificationToken: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userData, setUserData] = useState<VerifyResponse | null>(null);

  // Prevent double-fetching in React 18 Strict Mode
  const isMounted = useRef(false);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    const opts = { toastId: 'verify-email-toast', autoClose: 4000 };
    if (type === 'success') toast.success(content, opts);
    else toast.error(content, opts);
  };

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const verifyToken = async () => {
      if (!EmailVerificationToken) {
        setStatus('error');
        setErrorMessage('Verification token is missing from the link.');
        showToast('Invalid Link', 'Verification token is missing from the link.', 'error');
        return;
      }

      try {
        // PATCH Request to verify email
        const response = await fetch(`${BASE_URL}/api/v1/auth/verify-email/${EmailVerificationToken}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data: VerifyResponse = await response.json();

        if (!response.ok) {
          const msg = data?.message || 'Token is invalid or has expired.';
          setStatus('error');
          setErrorMessage(msg);
          showToast('Verification Failed', msg, 'error');
          return;
        }

        setStatus('success');
        setUserData(data);
        showToast('Account Verified', 'Your email has been successfully verified!', 'success');
      } catch (err: any) {
        const errorMsg = err?.message || 'A network error occurred or server rejected the CORS request.';
        setStatus('error');
        setErrorMessage(errorMsg);
        showToast('Verification Error', errorMsg, 'error');
      }
    };

    verifyToken();
  }, [EmailVerificationToken]);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[35%] -right-40 w-[450px] h-[450px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C14]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <LuBookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Libdesk <span className="text-blue-400 font-semibold font-mono text-sm">Cloud</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">www.libdesk.online</span>
            </div>
          </a>

          <a
            href="/signin"
            className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all shadow-md"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-16 w-full my-auto">
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl text-center font-mono">
          
          {/* LOADING */}
          {status === 'loading' && (
            <div className="space-y-6 py-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
                <LuLoader className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Verifying Your Email</h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  Please wait while we validate your email verification token...
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <div className="space-y-6 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <LuCheckCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
                <p className="text-xs text-emerald-400 font-semibold">Account activated successfully</p>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                Welcome <strong className="text-white">{userData?.fullName || 'aboard'}</strong>! Your email address <strong className="text-blue-400">{userData?.email}</strong> is now verified.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/30"
                >
                  <span>Proceed to Sign In</span>
                  <LuArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <div className="space-y-6 py-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/10">
                <LuCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                The verification token may be invalid, expired (10-minute limit), or already used.
              </p>

              <div className="pt-2 flex flex-col gap-3">
                <a
                  href="/signup"
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <LuMail className="w-4 h-4" />
                  <span>Resend / Sign Up Again</span>
                </a>
                <a
                  href="/signin"
                  className="text-xs text-blue-400 hover:underline pt-1"
                >
                  Already verified? Log in here
                </a>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050810] py-8 text-slate-500 text-xs font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Libdesk (www.libdesk.online). Operations in Bihar, India.</div>
          <div className="flex space-x-4">
            <a href="/" className="hover:text-slate-300">Home</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-slate-300">Privacy Policy</a>
            <span>•</span>
            <a href="/contact" className="hover:text-slate-300">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}