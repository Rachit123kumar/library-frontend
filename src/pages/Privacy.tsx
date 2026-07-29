'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuBookOpen,
  LuShieldCheck,
  // LuFileText,
  LuLock,
  // LuUserCheck,
  // LuDatabase,
  // LuCreditCard,
  LuMail,
  LuMapPin,
  // LuChevronRight,
  LuArrowLeft,
  // LuClock,
  LuScale
} from 'react-icons/lu';
import Footer from '../components/Footer';

export default function PolicyPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Background Grid & Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C14]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <LuBookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Libdesk <span className="text-blue-400 font-semibold">Legal</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">www.libdesk.online</span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-all"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative pt-12 pb-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
          <LuShieldCheck className="w-4 h-4" />
          <span>Effective Date: July 28, 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Legal Policies & Terms
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Transparency and security are at the core of our multi-tenant library platform. Learn how Libdesk protects tenant data and governs platform usage.
        </p>

        {/* Policy Tab Switcher */}
        <div className="pt-6 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LuLock className="w-4 h-4" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LuScale className="w-4 h-4" />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'privacy' ? (
          /* PRIVACY POLICY CONTENT */
          <div className="space-y-10 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="border-b border-slate-800 pb-6 space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LuLock className="text-blue-400 w-6 h-6" /> Libdesk Privacy Policy
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Applies to www.libdesk.online, Libdesk SaaS dashboard, and related services.
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to <strong className="text-white">Libdesk</strong> (accessible at <a href="https://www.libdesk.online" className="text-blue-400 underline">www.libdesk.online</a>), a multi-tenant cloud platform providing study hall, reading room, and library management solutions ("Service", "Platform", "we", "us", or "our"). We respect the privacy of our subscribers (library owners and administrators) as well as end-users (students, members, and library patrons). This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
            </p>

            {/* Section 1 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs flex items-center justify-center">1</span>
                Information We Collect
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We collect information directly from you when you register an account, set up a tenant workspace, or interact with our services.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-blue-400 uppercase">A. Tenant & Administrator Data</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Full Name, Email Address (<code className="text-blue-300 font-mono">hellobittukumar12@gmail.com</code> primary admin)</li>
                    <li>Phone Number and encrypted login credentials</li>
                    <li>Library Institution Name, branch addresses, and seat capacity</li>
                    <li>Merchant UPI IDs and transaction logs</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-indigo-400 uppercase">B. Student & Member Records</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Student Name, mobile number, emergency contact</li>
                    <li>Assigned seat number and shift preferences</li>
                    <li>Membership start/end dates and attendance logs</li>
                    <li>Cash collection and UPI reference records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs flex items-center justify-center">2</span>
                How We Use Your Information
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <li className="p-3 bg-[#080C14] border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-1">Service Provisioning:</strong> Setting up isolated tenant schemas, seat grid maps, and managing membership status.
                </li>
                <li className="p-3 bg-[#080C14] border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-1">Automated Reminders:</strong> Delivering transactional system alerts, invoices, and automated WhatsApp/SMS fee reminders.
                </li>
                <li className="p-3 bg-[#080C14] border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-1">Platform Maintenance:</strong> Monitoring service availability, sub-100ms API latency, and preventing unauthorized entry.
                </li>
                <li className="p-3 bg-[#080C14] border border-slate-800 rounded-xl">
                  <strong className="text-white block mb-1">Customer Support:</strong> Resolving technical inquiries submitted to our administrative support channels.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs flex items-center justify-center">3</span>
                Multi-Tenant Data Isolation & Security
              </h3>
              <div className="p-5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-blue-300">Bank-Grade Schema Separation</div>
                <p className="leading-relaxed">
                  Each library operating on Libdesk has logically isolated schema boundaries. Student data belonging to one tenant cannot be accessed or queried by another tenant. All data in transit is encrypted using 256-bit SSL/TLS protocols, and backups are encrypted at rest.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs flex items-center justify-center">4</span>
                Data Sharing & Data Retention
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Libdesk <strong className="text-white">does not sell or rent</strong> tenant or student data to third-party advertisers. We retain tenant data for as long as your subscription is active. Upon cancellation, tenant data is retained for 30 days to allow export before permanent purging.
              </p>
            </div>
          </div>
        ) : (
          /* TERMS OF SERVICE CONTENT */
          <div className="space-y-10 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="border-b border-slate-800 pb-6 space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LuScale className="text-blue-400 w-6 h-6" /> Libdesk Terms of Service
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Governing your use of www.libdesk.online and SaaS cloud subscriptions.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  By creating an account or accessing <a href="https://www.libdesk.online" className="text-blue-400 underline">www.libdesk.online</a>, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the Platform.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">2. Subscription Plans, Billing & Refunds</h3>
                <ul className="text-xs sm:text-sm text-slate-400 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-white">Free Trial:</strong> We offer a 14-day or 30-day free trial without credit card requirements.</li>
                  <li><strong className="text-white">Billing Tiers:</strong> Billed on a Monthly (e.g., ₹99/month) or Annual (e.g., ₹999/year) basis.</li>
                  <li><strong className="text-white">Refund Policy:</strong> Subscription fees are non-refundable once billed, except where required by applicable law or agreed in writing.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">3. Acceptable Use Policy</h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  You agree not to upload illegal or fraudulent data into your library portal, probe platform vulnerabilities, bypass multi-tenant isolation controls, or send unsolicited promotional spam via integrated messaging features.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">4. Governing Law & Jurisdiction</h3>
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p>
                    These terms shall be governed by and construed in accordance with the laws of India. Any legal disputes, claims, or proceedings shall be subject to the exclusive jurisdiction of the competent courts located in <strong className="text-white">Patna, Bihar, India</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information Callout */}
        <section className="mt-12 bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white">Questions about our policies?</h4>
            <p className="text-xs text-slate-400">Reach out directly to our administrative management team.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <LuMail className="text-blue-400" /> hellobittukumar12@gmail.com
              </span>
              <span className="flex items-center gap-1.5">
                <LuMapPin className="text-blue-400" /> Bihar, India
              </span>
            </div>
          </div>

          <a
            href="mailto:hellobittukumar12@gmail.com"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
          >
            Email Admin
          </a>
        </section>
      </main>

      {/* Footer */}
     <Footer/>
    </div>
  );
}