import React, { useState } from 'react';
import {
  LuBookOpen,
  LuUsers,
  LuShieldCheck,
  LuZap,
  LuMapPin,
  // LuAward,
  LuHeart,
  LuBuilding2,
  // LuGlobe,
  LuTarget,
  // LuCheck,
  LuSparkles,
  LuArrowRight,
  // LuPhone,
  LuMail,
  LuCpu,
  LuDatabase,
  // LuServer,
  // LuClock,
  LuTrendingUp,
  LuChevronRight,
  LuX,
  LuMenu
} from 'react-icons/lu';

const METRICS = [
  { label: 'Partner Study Halls', value: '150+', change: '+24% this quarter', icon: LuBuilding2, color: 'text-blue-400' },
  { label: 'Active Students Managed', value: '45,000+', change: 'Across Bihar & India', icon: LuUsers, color: 'text-emerald-400' },
  { label: 'Average Sync Latency', value: '< 45ms', change: 'Edge Database Queries', icon: LuZap, color: 'text-amber-400' },
  { label: 'Platform SLA Uptime', value: '99.99%', change: '256-bit Encrypted', icon: LuShieldCheck, color: 'text-cyan-400' },
];

const VALUES = [
  {
    icon: LuDatabase,
    title: 'Multi-Tenant Isolation',
    desc: 'Strict schema and row-level data separation for every library partner. Your student database is private, encrypted, and isolated.',
    badge: 'Enterprise Security'
  },
  {
    icon: LuCpu,
    title: 'Zero-Latency Seat Matrix',
    desc: 'Real-time multi-shift seat allocation engine optimized for high-concurrency peak admission hours across mobile and desktop.',
    badge: 'Sub-50ms Processing'
  },
  {
    icon: LuHeart,
    title: 'Built for Tier 2/3 Cities',
    desc: 'Designed ground-up to solve real operational problems faced by reading room owners in Bihar and growing urban study centers across India.',
    badge: 'Local Ground Impact'
  },
  {
    icon: LuTrendingUp,
    title: 'Pocket-Friendly SaaS',
    desc: 'Fair, transparent monthly and annual plans starting at ₹99/month with zero hidden setup costs or software lock-ins.',
    badge: 'Transparent Pricing'
  }
];

const TIMELINE = [
  {
    year: '2024',
    title: 'The Spark in Bihar',
    desc: 'Founded to replace manual register books and pen-paper seat management in local Patna study halls with a cloud-native solution.'
  },
  {
    year: '2025',
    title: 'Multi-Shift Engine Launch',
    desc: 'Pioneered split-seat assignment logic allowing 3 to 4 students to safely share a single desk across different timing shifts.'
  },
  {
    year: '2026',
    title: 'Libdesk Cloud V2.0',
    desc: 'Scaled to 150+ reading rooms, introducing automated WhatsApp renewal triggers, instant UPI receipts, and real-time matrix dashboards.'
  }
];

export default function AboutPage(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Grid & Ambient Glow (DigitalOcean Style) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[35%] -right-40 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] pointer-events-none rounded-full" />

      {/* */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C14]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <LuBookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Libdesk <span className="text-blue-400 font-semibold">About</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">www.libdesk.online</span>
            </div>
          </a>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-300">
            <a href="/" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Home</a>
            <a href="/about" className="py-2 px-3 rounded-xl text-blue-400 bg-blue-500/10 border border-blue-500/30 font-bold shadow-sm">About Us</a>
            <a href="/dashboard" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Dashboard</a>
            <a href="/admission" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Admission</a>
            <a href="/expire" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Expirations</a>
            <a href="/renew" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Renewals</a>
            <a href="/contact" className="py-2 px-3 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all">Contact</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3 font-mono text-xs">
            <a 
              href="/dashboard" 
              className="font-semibold uppercase tracking-wider text-slate-300 hover:text-white px-3.5 py-2 transition-colors"
            >
              Log In
            </a>
            <a 
              href="/admission" 
              className="px-4 py-2.5 font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0E1A] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 font-mono text-xs">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/80">
              <a href="/" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Home</a>
              <a href="/about" className="px-3 py-2 rounded-lg text-blue-400 bg-blue-500/10 border border-blue-500/30 font-bold">About Us</a>
              <a href="/dashboard" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Dashboard</a>
              <a href="/admission" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Admission</a>
              <a href="/expire" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Expirations</a>
              <a href="/renew" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Renewals</a>
              <a href="/contact" className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Contact</a>
            </div>
            <div className="pt-2">
              <a 
                href="/admission" 
                className="block w-full text-center py-2.5 font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        )}
      </header>

      {/* */}
      <main className="relative z-10">
        
        {/* HERO BANNER */}
        <section className="pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
              <LuMapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Built in Bihar, India • Operating Nationally</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Architecting the Future of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                Study Hall Infrastructure
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-mono">
              Libdesk (<code className="text-blue-300 font-normal">www.libdesk.online</code>) is a cloud-native multi-tenant platform created to replace paper registers with real-time seat matrices, automated WhatsApp fee renewals, and instant UPI collection ledgers.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs">
              <a
                href="/admission"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center justify-center gap-2"
              >
                <span>Launch Your Library</span>
                <LuChevronRight className="w-4 h-4" />
              </a>
              <a
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold uppercase tracking-wider rounded-xl border border-slate-800 transition-all text-center"
              >
                Talk to Engineering Team
              </a>
            </div>

          </div>
        </section>

        {/* */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">{stat.label}</span>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono">{stat.value}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">{stat.change}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
                <LuTarget className="w-3.5 h-3.5" />
                <span>Our Origin Story</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Born in Bihar to Solve Real Ground Challenges
              </h2>

              <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed font-mono">
                <p>
                  In cities across Bihar and northern India, thousands of students rely on self-study reading rooms to prepare for competitive examinations. However, library operators historically managed 100+ seats using paper registers, leading to duplicate seat bookings, forgotten renewal dues, and lost revenue.
                </p>
                <p>
                  <strong className="text-white">Libdesk</strong> was founded by <strong className="text-blue-400">Bittu Kumar</strong> in Bihar with a clear mission: build enterprise-grade, lightning-fast cloud software tailored specifically for reading room administrators.
                </p>
                <p>
                  Today, Libdesk powers study centers across Bihar and neighboring states, delivering sub-50ms seat matrix queries, schema isolation, and automated payment workflows.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                    BK
                  </div>
                  <div>
                    <div className="text-white font-bold">Bittu Kumar</div>
                    <div className="text-slate-400 text-[11px]">Founder & Platform Architect</div>
                  </div>
                </div>
                <a
                  href="mailto:hellobittukumar12@gmail.com"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all font-bold"
                >
                  Contact Founder
                </a>
              </div>
            </div>

            {/* Terminal Preview Block (DigitalOcean Style) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl font-mono text-xs space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span>libdesk-cloud-node ~ bash</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p className="text-slate-500">$ curl -X GET https://api.libdesk.online/api/v1/health</p>
                  <p className="text-emerald-400 font-bold">{"{"} "status": "ONLINE", "region": "Bihar, IN", "latency": "22ms" {"}"}</p>
                  
                  <p className="text-slate-500 pt-2">$ libdesk status --tenant-isolation</p>
                  <p className="text-blue-400">[INFO] PostgreSQL Schema Isolation: Active</p>
                  <p className="text-blue-400">[INFO] Realtime Shift Grid Map: Synced</p>
                  <p className="text-blue-400">[INFO] SSL Encryption: 256-Bit Active</p>
                  
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 mt-4 text-[11px] space-y-1">
                    <span className="text-amber-400 block font-bold">Primary Admin Contact:</span>
                    <span className="text-slate-300 block">Email: hellobittukumar12@gmail.com</span>
                    <span className="text-slate-300 block">Domain: www.libdesk.online</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">Engineered For Reliability</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white">Our Core Platform Values</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {val.badge}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2 font-mono">{val.title}</h4>
                      <p className="text-slate-400 text-xs font-mono mt-2 leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">Constant Evolution</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">The Libdesk Milestone Timeline</h3>
          </div>

          <div className="relative border-l border-slate-800 ml-4 md:ml-32 space-y-10">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="relative pl-6 md:pl-10 group">
                
                {/* Year Marker Badge */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-900 border border-blue-500 text-blue-400 flex items-center justify-center font-mono text-xs font-bold ring-4 ring-[#080C14]">
                  {idx + 1}
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-600/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                      {item.year}
                    </span>
                    <h4 className="text-base font-bold text-white font-mono">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">{item.desc}</p>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 relative overflow-hidden text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-mono text-blue-300">
              <LuSparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Setup • No Credit Card Required</span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Digitize Your Study Hall?
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-mono leading-relaxed">
              Join 150+ library partners managing seats, shifts, and revenues seamlessly with Libdesk.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs">
              <a
                href="/admission"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/30 border border-blue-400/30 flex items-center justify-center gap-2"
              >
                <span>Start Free Trial Now</span>
                <LuArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-[#080C14] hover:bg-slate-900 text-slate-300 hover:text-white font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all text-center"
              >
                Schedule Live Demo
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* */}
      <footer className="border-t border-slate-800/80 bg-[#050810] py-12 text-slate-400 text-xs relative z-10 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <LuBookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base text-white">Libdesk Cloud Platform</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              The multi-tenant study hall management system built in Bihar, India. Operating on <a href="https://www.libdesk.online" className="text-blue-400 underline">www.libdesk.online</a>.
            </p>
          </div>

          <div>
            <div className="text-white font-bold uppercase mb-3 text-[11px] tracking-wider">Navigation</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/admission" className="hover:text-white transition-colors">Admission</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold uppercase mb-3 text-[11px] tracking-wider">Features</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/expire" className="hover:text-white transition-colors">Expirations</a></li>
              <li><a href="/renew" className="hover:text-white transition-colors">Renewals</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold uppercase mb-3 text-[11px] tracking-wider">Contact & Legal</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li className="text-blue-400 pt-1 flex items-center gap-1"><LuMail className="w-3.5 h-3.5" /> hellobittukumar12@gmail.com</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>© {new Date().getFullYear()} Libdesk (www.libdesk.online). Operations in Bihar, India.</div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Cloud Infrastructure Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
}