import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import {
  LuBookOpen,
  LuUsers,
  LuArmchair,
  LuClock,
  LuCreditCard,
  LuChartBar,
  LuRepeat,
  LuSearch,
  LuSmartphone,
  LuCloudUpload,
  LuShieldCheck,
  LuCheck,
  LuChevronRight,
  LuZap,
  LuHeadphones,
  LuDollarSign,
  LuUser
} from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface UserData {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
}

export default function Page(): React.JSX.Element {
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch logged in user data
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          method: 'GET',
          credentials: 'include',
           headers: {
          'Content-Type': 'application/json',
          
      }
        
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('User is not authenticated', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const featuresList = [
    { title: "Student Management", desc: "Track complete student profiles, identity documents, contact info, and attendance records.", icon: LuUsers, color: "from-blue-500 to-indigo-500" },
    { title: "Membership Management", desc: "Create custom plans, handle plan upgrades, auto-calculate fees, and track validity.", icon: LuBookOpen, color: "from-indigo-500 to-purple-500" },
    { title: "Smart Seat Allocation", desc: "Interactive seat grid map. Assign fixed or flexible seats with real-time occupancy status.", icon: LuArmchair, color: "from-cyan-500 to-blue-500" },
    { title: "Multiple Shift Management", desc: "Configure Morning, Evening, Night, or Full-Day shifts and prevent seat overlap.", icon: LuClock, color: "from-emerald-500 to-teal-500" },
    { title: "Cash & UPI Payment Tracking", desc: "Record cash transactions & scan UPI payments instantly with automatic digital receipts.", icon: LuCreditCard, color: "from-amber-500 to-orange-500" },
    { title: "Revenue Dashboard", desc: "Visual charts for monthly collections, pending dues, cash flow, and financial health.", icon: LuChartBar, color: "from-purple-500 to-pink-500" },
    { title: "Reports & Analytics", desc: "Export student lists, revenue statements, and attendance logs in Excel & PDF formats.", icon: LuChartBar, color: "from-blue-400 to-cyan-400" },
    { title: "Membership Renewal", desc: "One-click renewal engine with automated SMS and WhatsApp payment reminders.", icon: LuRepeat, color: "from-rose-500 to-red-500" },
    { title: "Search & Filters", desc: "Instant search for students by seat number, phone number, name, or payment status.", icon: LuSearch, color: "from-sky-500 to-blue-600" },
    { title: "Mobile Responsive", desc: "Access full administrative control from any smartphone or tablet browser.", icon: LuSmartphone, color: "from-teal-400 to-emerald-500" },
    { title: "Cloud Backup", desc: "Automated daily cloud sync ensures zero data loss for your library database.", icon: LuCloudUpload, color: "from-violet-500 to-indigo-600" },
    { title: "Secure Data", desc: "Bank-grade SSL encryption with role-based access control for library staff.", icon: LuShieldCheck, color: "from-blue-600 to-indigo-700" }
  ];

  const steps = [
    { num: "01", title: "Create Account", desc: "Sign up in 30 seconds with basic details." },
    { num: "02", title: "Setup Library", desc: "Configure library name, branches, and timing shifts." },
    { num: "03", title: "Add Seats", desc: "Create your interactive seat grid visual layout." },
    { num: "04", title: "Add Students", desc: "Register students & attach photo ID proof." },
    { num: "05", title: "Collect Payments", desc: "Log Cash or UPI payments & issue instant receipts." },
    { num: "06", title: "Manage Everything", desc: "Track renewals, dues, and seats from your dashboard." }
  ];

  const whyUs = [
    { title: "Affordable", desc: "Pocket-friendly pricing starting at just ₹99/month with no hidden setup fees.", icon: LuDollarSign },
    { title: "Fast", desc: "Optimized cloud engine delivers sub-100ms response times for all operations.", icon: LuZap },
    { title: "Secure", desc: "End-to-end data encryption with strict privacy protection for student records.", icon: LuShieldCheck },
    { title: "Cloud Based", desc: "Zero software installation required. Access from any device, anywhere.", icon: LuCloudUpload },
    { title: "Easy to Use", desc: "Intuitive UI designed for non-technical library staff. Zero training needed.", icon: LuBookOpen },
    { title: "Mobile Friendly", desc: "Full feature parity on mobile devices for managing on the move.", icon: LuSmartphone },
    { title: "Daily Backups", desc: "Automatic redundant backups guarantees your data is safe 24/7.", icon: LuRepeat },
    { title: "24×7 Support", desc: "Dedicated phone, WhatsApp, and email assistance whenever you need help.", icon: LuHeadphones }
  ];

  const faqs = [
    { q: "Is there a free trial?", a: "Yes! ARA Library Management offers a full 14-day free trial with unrestricted access to all features. No credit card required." },
    { q: "Can I upgrade or downgrade anytime?", a: "Absolutely. You can switch between Monthly and Yearly billing plans or scale your seat capacity anytime." },
    { q: "Does it support Cash & UPI payment tracking?", a: "Yes! You can record payments made via UPI (GPay, PhonePe, Paytm), Cash, or Cards with automated digital receipts." },
    { q: "Can multiple students share one seat in different shifts?", a: "Yes. Our Smart Seat Allocation system allows different students to reserve the exact same seat across different shifts." },
    { q: "Is it mobile friendly?", a: "100%. ARA Library Management is fully responsive across smartphones, tablets, laptops, and desktops." }
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Background Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Dynamic Navigation Header */}
      <nav className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <LuBookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <span>ARA<span className="text-blue-500">Library</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <LuUser className="w-4 h-4 text-slate-400" />
                  <span>{user.name || user.fullName}</span>
                </div>
                <Link 
                  to="/me" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  Console
                  <LuChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <Link 
                to="/signin" 
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </nav>

      {/* Main Content View */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-8 pb-20 md:pt-16 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Multi-Tenant Study Hall Platform 2.0</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Manage Your Library <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                  Smarter, Faster, and Easier
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Manage students, seats, memberships, payments, renewals, and shifts from one powerful cloud platform built for modern study centers.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  to={user ? "/me" : "/signin"} 
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/30"
                >
                  <span>{user ? "Open Console" : "Get Started"}</span>
                  <LuChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Stats */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
                <div className="space-y-0.5"><div className="text-xl sm:text-2xl font-extrabold text-white font-mono">99.9%</div><div className="text-xs text-slate-400">Uptime</div></div>
                <div className="space-y-0.5"><div className="text-xl sm:text-2xl font-extrabold text-white font-mono">256-Bit</div><div className="text-xs text-slate-400">Cloud Encryption</div></div>
                <div className="space-y-0.5"><div className="text-xl sm:text-2xl font-extrabold text-white font-mono">&lt; 100ms</div><div className="text-xs text-slate-400">Fast Speed</div></div>
                <div className="space-y-0.5"><div className="text-xl sm:text-2xl font-extrabold text-white font-mono">100%</div><div className="text-xs text-slate-400">Mobile Friendly</div></div>
              </div>
            </div>

            {/* Interactive Seat Canvas Preview */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400">admin.aralibrary.com</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">LIVE DEMO</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#080C14] p-3 rounded-xl border border-slate-800"><div className="text-[10px] font-mono text-slate-400">Total Seats</div><div className="text-lg font-bold text-white">120</div><div className="text-[9px] text-emerald-400">92 Occupied</div></div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-slate-800"><div className="text-[10px] font-mono text-slate-400">Active Shift</div><div className="text-lg font-bold text-cyan-400">Morning</div><div className="text-[9px] text-slate-400">6 AM - 12 PM</div></div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-slate-800"><div className="text-[10px] font-mono text-slate-400">Monthly Dues</div><div className="text-lg font-bold text-white">₹48,500</div><div className="text-[9px] text-emerald-400">↑ 18% this month</div></div>
                </div>

                <div className="bg-[#080C14] p-4 rounded-xl border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-semibold text-slate-300 font-mono">Seat Allocation Grid</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded bg-emerald-500" /> Booked</span>
                      <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded bg-slate-700" /> Available</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {[...Array(16)].map((_, i) => {
                      const isBooked = [0, 1, 3, 4, 6, 7, 8, 10, 11, 13, 14, 15].includes(i);
                      return (
                        <div key={i} className={`h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-all ${isBooked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/80 text-slate-400 border border-slate-700'}`}>
                          A-{i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#080C14] p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">RA</div>
                    <div>
                      <div className="font-semibold text-slate-200">Rahul Sharma (Seat A-04)</div>
                      <div className="text-[10px] text-slate-500">Full-Day Shift • Paid via UPI</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded border border-emerald-500/20">Active</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">Comprehensive Capabilities</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white">Everything You Need to Run Your Library</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-950/60 border-y border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">Seamless Setup</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white">Get Up and Running in 6 Steps</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="font-mono text-3xl font-extrabold text-blue-500/40">{step.num}</div>
                <h4 className="text-xl font-bold text-white">{step.title}</h4>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">Simple Pricing</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white">Choose the Best Plan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Trial */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-blue-400 uppercase font-semibold mb-2">14-Day Free Trial</div>
                <h4 className="text-2xl font-bold text-white">Free Trial</h4>
                <div className="my-6"><span className="text-4xl font-extrabold text-white">₹0</span><span className="text-slate-400 text-xs"> / 14 Days</span></div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-6">
                  <li className="flex items-center gap-2.5"><LuCheck className="w-4 h-4 text-blue-400 shrink-0" /> Full Access to All Features</li>
                  <li className="flex items-center gap-2.5"><LuCheck className="w-4 h-4 text-blue-400 shrink-0" /> No Credit Card Required</li>
                </ul>
              </div>
              <Link to={user ? "/me" : "/signin"} className="mt-8 block text-center w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700">
                {user ? "Open Console" : "Start Free Trial"}
              </Link>
            </div>

            {/* Monthly */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-indigo-400 uppercase font-semibold mb-2">Flexible Monthly</div>
                <h4 className="text-2xl font-bold text-white">Monthly Plan</h4>
                <div className="my-6"><span className="text-4xl font-extrabold text-white">₹99</span><span className="text-slate-400 text-xs"> / month</span></div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-6">
                  <li className="flex items-center gap-2.5"><LuCheck className="w-4 h-4 text-indigo-400 shrink-0" /> Unlimited Students</li>
                  <li className="flex items-center gap-2.5"><LuCheck className="w-4 h-4 text-indigo-400 shrink-0" /> Payment & Cash/UPI Tracking</li>
                </ul>
              </div>
              <Link to={user ? "/me" : "/signin"} className="mt-8 block text-center w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700">
                {user ? "Open Console" : "Choose Monthly"}
              </Link>
            </div>

            {/* Yearly */}
            <div className="rounded-2xl bg-slate-900 border-2 border-blue-500 p-8 flex flex-col justify-between shadow-2xl relative scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-mono text-[10px] uppercase font-bold px-3.5 py-1 rounded-full shadow-lg">Best Value</div>
              <div>
                <div className="font-mono text-xs text-blue-400 uppercase font-semibold mb-2">Best Savings</div>
                <h4 className="text-2xl font-bold text-white">Yearly Plan</h4>
                <div className="my-6"><span className="text-4xl font-extrabold text-white">₹999</span><span className="text-slate-400 text-xs"> / year</span></div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-6">
                  <li className="flex items-center gap-2.5"><LuCheck className="w-4 h-4 text-blue-400 shrink-0" /> Everything in Monthly</li>
                  <li className="flex items-center gap-2.5"><LuCheck className="w-4 h-4 text-blue-400 shrink-0" /> Save 2 Months Annual Fee</li>
                </ul>
              </div>
              <Link to={user ? "/me" : "/signin"} className="mt-8 block text-center w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30">
                {user ? "Open Console" : "Get Started Yearly"}
              </Link>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">Unmatched Quality</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white">Why Library Owners Choose ARA</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">FAQ</h2>
            <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)} className="w-full text-left p-5 text-sm sm:text-base font-semibold text-white flex justify-between items-center gap-4 focus:outline-none">
                  <span>{faq.q}</span>
                  <span className={`text-blue-400 text-xs transform transition-transform ${faqOpenIndex === idx ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {faqOpenIndex === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
     
    </div>
  );
}