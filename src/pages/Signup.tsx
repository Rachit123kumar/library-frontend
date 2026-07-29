import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  LuBookOpen,
  LuMail,
  LuLock,
  LuPhone,
  LuUser,
  LuEye,
  LuEyeOff,
  LuShieldCheck,
  LuSparkles,
  LuArrowRight,
  LuCheckCheck ,
  LuMenu,
  LuX,
  LuZap,
  LuBuilding2,
//   LuCheck,
//   LuChevronRight
} from 'react-icons/lu';

const SignupNavbar: React.FC = () => {
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
              Libdesk <span className="text-blue-400 font-semibold font-mono text-sm">Cloud</span>
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
          <span className="text-slate-400">Already registered?</span>
          <a
            href="/dashboard"
            className="px-4 py-2 font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all shadow-md"
          >
            Log In
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
              href="/dashboard"
              className="block w-full text-center py-2.5 font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30"
            >
              Sign In To Portal
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default function SignupPage(): React.JSX.Element {
  // Form State
  const [fullName, setFullName] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Control States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSubmitted] = useState(false);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    const opts = { toastId: 'signup-single-toast', autoClose: 3000 };
    if (type === 'success') toast.success(content, opts);
    else if (type === 'error') toast.error(content, opts);
    else toast.info(content, opts);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Validation Error', 'Please enter your full name.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Validation Error', 'Please enter a valid email address.', 'error');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast('Validation Error', 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Password Mismatch', 'Password and confirm password do not match.', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('Terms Required', 'Please accept the terms of service to proceed.', 'error');
      return;
    }

    // Simulated API payload submission
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSubmitted(true);
      showToast('Tenant Registered!', `Welcome aboard, ${fullName}. Account created.`, 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden flex flex-col justify-between">

      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[35%] -right-40 w-[450px] h-[450px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Persistent Header */}
      <SignupNavbar />

      {}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full my-auto">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: BRAND PROMO & PLATFORM ADVANTAGES */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
              <LuSparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>14-Day Unrestricted Free Trial</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Launch Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                Digital Study Center
              </span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm font-mono leading-relaxed">
              Join 150+ library owners managing seats, multi-shift allocations, and instant UPI receipts with Libdesk Cloud.
            </p>

            {/* Feature Highlights List */}
            <div className="space-y-3.5 pt-2 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <LuShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">Multi-Tenant Isolation</div>
                  <div className="text-[11px] text-slate-400">Strict schema database separation for total privacy.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <LuZap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">Sub-50ms Seat Matrix</div>
                  <div className="text-[11px] text-slate-400">Instant seat assignment and WhatsApp renewal triggers.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <LuCheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">Zero Setup Fees</div>
                  <div className="text-[11px] text-slate-400">No credit card required. Up and running in 30 seconds.</div>
                </div>
              </div>
            </div>

            {/* Quote Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 text-xs font-mono text-slate-300 space-y-1">
              <span className="text-blue-400 font-bold block">"Made my study hall 10x faster."</span>
              <span className="text-slate-400 text-[11px] block">— Managing Director, Apex Study Hall, Patna</span>
            </div>
          </div>

          {}
          {/* RIGHT COLUMN: REGISTRATION FORM CARD */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">

              {isSuccess ? (
                /* SUCCESS MESSAGE CARD */
                <div className="py-12 text-center space-y-4 font-mono">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                    <LuCheckCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Registration Complete!</h2>
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    Thank you for joining Libdesk, <strong className="text-white">{fullName}</strong>. Your tenant portal for <strong className="text-blue-400">{libraryName || 'your library'}</strong> has been initialized.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="/dashboard"
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs"
                    >
                      <span>Go to Dashboard</span>
                      <LuArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-slate-800 pb-4 space-y-1">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                      <LuBuilding2 className="w-5 h-5 text-blue-400" />
                      Create Admin Tenant Account
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Enter your identity, contact details, and account credentials below.
                    </p>
                  </div>

                  {/* 1. Full Name & Library Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Admin Full Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuUser className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Library Display Title
                      </label>
                      <div className="relative">
                        <LuBuilding2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={libraryName}
                          onChange={(e) => setLibraryName(e.target.value)}
                          placeholder="e.g. ARA Reading Room"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Email Address & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuMail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@domain.com"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Phone / WhatsApp <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuPhone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Gender Selection Pills */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Gender Type <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                      {[
                        { id: 'male', label: 'Male' },
                        { id: 'female', label: 'Female' },
                        { id: 'other', label: 'Other' }
                      ].map((item) => {
                        const isSelected = gender === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setGender(item.id as 'male' | 'female' | 'other')}
                            className={`py-2.5 px-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                                : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-700'}`} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuLock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
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

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Confirm Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuLock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showConfirmPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[11px] font-mono text-slate-400 leading-snug cursor-pointer select-none">
                      I agree to the <a href="/privacy" className="text-blue-400 underline">Terms of Service</a> and <a href="/privacy" className="text-blue-400 underline">Privacy Policy</a> governing multi-tenant library operations.
                    </label>
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/30"
                  >
                    {submitting ? (
                      <span>Initializing Tenant Schema...</span>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <LuArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Mobile Sign In Redirection */}
                  <div className="text-center font-mono text-xs text-slate-400 pt-2">
                    Already have an account?{' '}
                    <a href="/dashboard" className="text-blue-400 font-bold hover:underline">
                      Sign In here
                    </a>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {}
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