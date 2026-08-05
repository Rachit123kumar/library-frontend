import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  LuCheckCheck,
  LuMenu,
  LuX,
  LuZap,
  LuBuilding2,
  LuMailCheck,
} from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://www.libdesk.online';

// Zod Schema Validation
const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: 'Full name must be at least 3 characters.' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Please select a gender.',
  }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

const SignupNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
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

        <nav className="hidden md:flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-300">
          <a href="/" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Home</a>
          <a href="/about" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">About</a>
          <a href="/contact" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Contact</a>
        </nav>

        <div className="hidden sm:flex items-center space-x-3 font-mono text-xs">
          <span className="text-slate-400">Already registered?</span>
          <a
            href="/signin"
            className="px-4 py-2 font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all shadow-md"
          >
            Log In
          </a>
        </div>

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

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0E1A] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/80">
            <a href="/" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Home</a>
            <a href="/about" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">About Us</a>
            <a href="/contact" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Contact</a>
          </div>
          <div className="pt-1">
            <a
              href="/signin"
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
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          method: 'GET',
          credentials: 'include', // Ensures cookies/session are sent
        });
        
        if (response.ok) {
          // If status is 200 OK, redirect to /me
          navigate('/me');
        }
        // If status is 401 or anything else, we do nothing and stay on the signup page
      } catch (err) {
        // Silently ignore network errors for the auth check
        console.error("Auth check failed:", err);
      }
    };

    checkSession();
  }, [navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      gender: 'male',
      password: '',
    },
  });

  const selectedGender = watch('gender');

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    const opts = { toastId: 'signup-single-toast', autoClose: 5000 };
    if (type === 'success') toast.success(content, opts);
    else if (type === 'error') toast.error(content, opts);
    else toast.info(content, opts);
  };

  const onSubmit: SubmitHandler<SignupFormInputs> = async (formData) => {
    setSubmitting(true);

    try {
      // POST to /api/v1/auth/signup
      const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          gender: formData.gender,
          password: formData.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          'Failed to sign up. Please try again.';
        
        throw new Error(errorMessage);
      }

      const msg = responseData?.message || 'We have sent a verification token to your email. Please verify.';
      
      setUserEmail(formData.email.trim());
      setSuccessMessage(msg);
      setIsSuccess(true);
      showToast('Verification Email Sent', msg, 'success');

    } catch (err: any) {
      const displayError = err?.message || 'A network error occurred. Please try again.';
      showToast('Signup Failed', displayError, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[35%] -right-40 w-[450px] h-[450px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

      <SignupNavbar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN */}
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

            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 text-xs font-mono text-slate-300 space-y-1">
              <span className="text-blue-400 font-bold block">"Made my study hall 10x faster."</span>
              <span className="text-slate-400 text-[11px] block">— Managing Director, Apex Study Hall, Patna</span>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">
              {isSuccess ? (
                /* EMAIL VERIFICATION NOTICE */
                <div className="py-12 text-center space-y-5 font-mono">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
                    <LuMailCheck className="w-8 h-8 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Check Your Inbox</h2>
                    <p className="text-blue-400 text-xs font-semibold">{successMessage}</p>
                  </div>

                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    We sent an email to <strong className="text-white">{userEmail}</strong> containing a link to verify your account. The link is valid for <strong className="text-white">10 minutes</strong>.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="/signin"
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs"
                    >
                      <span>Proceed to Sign In</span>
                      <LuArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* SIGNUP FORM */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="border-b border-slate-800 pb-4 space-y-1">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                      <LuBuilding2 className="w-5 h-5 text-blue-400" />
                      Create Account
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Enter your details below to register.
                    </p>
                  </div>

                  {/* 1. Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <LuUser className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        {...register('fullName')}
                        className={`w-full bg-[#080C14] border ${
                          errors.fullName ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
                        } rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-colors`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.fullName.message}</p>
                    )}
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
                          type="email"
                          placeholder="admin@domain.com"
                          {...register('email')}
                          className={`w-full bg-[#080C14] border ${
                            errors.email ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
                          } rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-colors`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[10px] text-rose-400 font-mono">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-slate-300">
                        Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuPhone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          {...register('phone')}
                          className={`w-full bg-[#080C14] border ${
                            errors.phone ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
                          } rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-colors`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[10px] text-rose-400 font-mono">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* 3. Gender Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Gender <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                      {[
                        { id: 'male', label: 'Male' },
                        { id: 'female', label: 'Female' },
                        { id: 'other', label: 'Other' },
                      ].map((item) => {
                        const isSelected = selectedGender === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setValue('gender', item.id as 'male' | 'female' | 'other')}
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
                    {errors.gender && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* 4. Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <LuLock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className={`w-full bg-[#080C14] border ${
                          errors.password ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
                        } rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <LuArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center font-mono text-xs text-slate-400 pt-2">
                    Already have an account?{' '}
                    <a href="/signin" className="text-blue-400 font-bold hover:underline">
                      Sign In here
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

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