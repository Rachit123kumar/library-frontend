import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  LuBookOpen,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuShieldCheck,
  LuSparkles,
  LuArrowRight,
  LuCheckCheck,
  LuMenu,
  LuX,
//   LuZap,
  LuKeyRound,
  LuClock,
  LuRefreshCw,
  LuArrowLeft
} from 'react-icons/lu';

const LoginNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C14]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center space-x-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <LuBookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              Libdesk <span className="text-blue-400 font-semibold font-mono text-sm">Auth</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">www.libdesk.online</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-300">
          <a href="/" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Home</a>
          <a href="/about" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">About</a>
          <a href="/dashboard" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Dashboard</a>
          <a href="/contact" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Contact</a>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center space-x-3 font-mono text-xs">
          <span className="text-slate-400">New Library Tenant?</span>
          <a
            href="/signup"
            className="px-4 py-2 font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 border border-blue-400/30"
          >
            Create Account
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0E1A] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/80">
            <a href="/" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Home</a>
            <a href="/about" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">About Us</a>
            <a href="/dashboard" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Dashboard</a>
            <a href="/contact" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Contact</a>
          </div>
          <div className="pt-1">
            <a
              href="/signup"
              className="block w-full text-center py-2.5 font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30"
            >
              Register New Library
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default function LoginPage(): React.JSX.Element {
  // Auth Mode: 'password' (Default) or 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Mode 1 State: Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Mode 2 State: Email OTP Flow
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(0);

  // Global UX Control States
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Resend Timer Countdown Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    const opts = { toastId: 'login-single-toast', autoClose: 3000 };
    if (type === 'success') toast.success(content, opts);
    else if (type === 'error') toast.error(content, opts);
    else toast.info(content, opts);
  };

  const handlePasswordLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      showToast('Validation Error', 'Please enter a valid email address.', 'error');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters.', 'error');
      return;
    }

    setSubmitting(true);
    // Simulated Password Authentication API call
    setTimeout(() => {
      setSubmitting(false);
      setIsSuccess(true);
      showToast('Login Successful!', 'Redirecting to your Admin Dashboard...', 'success');
    }, 1200);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      showToast('Validation Error', 'Please enter a valid email address for OTP.', 'error');
      return;
    }

    setSubmitting(true);
    // Simulated OTP Request API call
    setTimeout(() => {
      setSubmitting(false);
      setOtpSent(true);
      setTimer(30);
      showToast('OTP Dispatched!', `A 6-digit access code was sent to ${otpEmail}.`, 'success');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      showToast('Validation Error', 'Please enter the complete OTP code received in your email.', 'error');
      return;
    }

    setSubmitting(true);
    // Simulated OTP Verification API call
    setTimeout(() => {
      setSubmitting(false);
      setIsSuccess(true);
      showToast('OTP Verified!', 'Session authenticated. Loading dashboard...', 'success');
    }, 1200);
  };

  const handleForgotPassword = () => {
    showToast('Reset Link Requested', 'If an account exists, a password reset email will be sent shortly.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden flex flex-col justify-between">

      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[35%] -right-40 w-[450px] h-[450px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Persistent Navigation Header */}
      <LoginNavbar />

      {/* Main Workspace Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full my-auto">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: SECURITY & ADVANTAGES SPOTLIGHT */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
              <LuShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Tenant Cloud Security v2.4</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Sign In To Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                Library Portal
              </span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm font-mono leading-relaxed">
              Access your real-time seat matrices, shift schedules, student membership records, and instant UPI collection ledgers.
            </p>

            {/* Feature Cards List */}
            {/* <div className="space-y-3.5 pt-2 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <LuLock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">256-Bit Encrypted Sessions</div>
                  <div className="text-[11px] text-slate-400">Bank-grade schema isolation for every library instance.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <LuZap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">Instant Mode Switch</div>
                  <div className="text-[11px] text-slate-400">Choose password authentication or instant 1-click email OTPs.</div>
                </div>
              </div>
            </div> */}

            {/* Support Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 text-xs font-mono text-slate-300 space-y-1">
              <span className="text-blue-400 font-bold block">Need assistance with your portal?</span>
              <span className="text-slate-400 text-[11px] block">Email admin support at: <code className="text-blue-300 font-normal">hellobittukumar12@gmail.com</code></span>
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN FORM CARD */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">

              {isSuccess ? (
                /* SUCCESS REDIRECTION CARD */
                <div className="py-12 text-center space-y-4 font-mono">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                    <LuCheckCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Authentication Successful!</h2>
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    Welcome back! Your admin workspace session has been validated. Proceeding to live workspace...
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="/dashboard"
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs"
                    >
                      <span>Open Control Dashboard</span>
                      <LuArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* LOGIN FORM & AUTH MODE TOGGLE */
                <div className="space-y-6">

                  {/* Mode Selector Segmented Tabs */}
                  <div className="p-1.5 bg-[#080C14] border border-slate-800 rounded-2xl grid grid-cols-2 gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setAuthMode('password')}
                      className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        authMode === 'password'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LuLock className="w-4 h-4" />
                      <span>Password Login</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMode('otp')}
                      className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        authMode === 'otp'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LuKeyRound className="w-4 h-4" />
                      <span>Email OTP Login</span>
                    </button>
                  </div>

                  {authMode === 'password' ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-5">
                      <div className="border-b border-slate-800 pb-3 space-y-1">
                        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                          <LuLock className="w-4 h-4 text-blue-400" />
                          Sign In with Email & Password
                        </h2>
                        <p className="text-xs text-slate-400 font-mono">
                          Enter your administrative login credentials to access your tenant dashboard.
                        </p>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono uppercase text-slate-300">
                          Admin Email Address <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <LuMail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@domain.com"
                            className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-mono uppercase text-slate-300">
                            Password <span className="text-rose-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-[11px] font-mono text-blue-400 hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <LuLock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-xs font-mono text-slate-400 cursor-pointer select-none">
                          Keep session active on this browser for 30 days
                        </label>
                      </div>

                      {/* Submit Action */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/30"
                      >
                        {submitting ? (
                          <>
                            <LuRefreshCw className="w-4 h-4 animate-spin" />
                            <span>Validating Credentials...</span>
                          </>
                        ) : (
                          <>
                            <span>Log In to Portal</span>
                            <LuArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div>
                      {!otpSent ? (
                        /* STEP 1: Request Email OTP */
                        <form onSubmit={handleSendOtp} className="space-y-5">
                          <div className="border-b border-slate-800 pb-3 space-y-1">
                            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                              <LuKeyRound className="w-4 h-4 text-cyan-400" />
                              Login via One-Time Password (OTP)
                            </h2>
                            <p className="text-xs text-slate-400 font-mono">
                              We will dispatch a secure 6-digit access token directly to your registered email.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-mono uppercase text-slate-300">
                              Registered Email Address <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                              <LuMail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                required
                                type="email"
                                value={otpEmail}
                                onChange={(e) => setOtpEmail(e.target.value)}
                                placeholder="e.g. director@library.com"
                                className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 border border-cyan-400/30"
                          >
                            {submitting ? (
                              <>
                                <LuRefreshCw className="w-4 h-4 animate-spin" />
                                <span>Sending OTP Code...</span>
                              </>
                            ) : (
                              <>
                                <span>Send One-Time Password</span>
                                <LuSparkles className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        /* STEP 2: Verify Received OTP */
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                            <div>
                              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                                <LuKeyRound className="w-4 h-4 text-emerald-400" />
                                Enter 6-Digit OTP Code
                              </h2>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                Sent to <strong className="text-white">{otpEmail}</strong>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode('');
                              }}
                              className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <LuArrowLeft className="w-3 h-3" /> Change
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-mono uppercase text-slate-300">
                              Verification Code <span className="text-rose-400">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="e.g. 482910"
                              className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <LuClock className="w-3.5 h-3.5 text-slate-500" />
                              Resend availability:
                            </span>
                            {timer > 0 ? (
                              <span className="text-amber-400 font-bold">{timer}s remaining</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                className="text-emerald-400 font-bold hover:underline"
                              >
                                Resend OTP Now
                              </button>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 border border-emerald-400/30"
                          >
                            {submitting ? (
                              <>
                                <LuRefreshCw className="w-4 h-4 animate-spin" />
                                <span>Verifying OTP Code...</span>
                              </>
                            ) : (
                              <>
                                <span>Verify & Access Portal</span>
                                <LuCheckCheck className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Redirection Footer Link */}
                  <div className="text-center font-mono text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    Don't have a library account yet?{' '}
                    <a href="/signup" className="text-blue-400 font-bold hover:underline">
                      Register Tenant Account
                    </a>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Persistent Footer */}
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