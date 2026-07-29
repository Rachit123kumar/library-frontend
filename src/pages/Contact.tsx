'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // LuBookOpen,
  LuMail,
  LuMapPin,
  LuClock,
  // LuPhoneCall,
  LuSend,
  LuCheckCheck ,
  // LuArrowLeft,
  LuUser,
  LuBuilding2,
  LuMessageSquare,
  LuSparkles,
  LuHandHelping ,
  LuPhone
} from 'react-icons/lu';
import Navbar from '../components/Navbar';

export default function ContactPage(): React.JSX.Element {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    libraryName: '',
    inquiryType: 'general',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Front-end UI form submission representation
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      libraryName: '',
      inquiryType: 'general',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] -right-40 w-[450px] h-[450px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

      {}
     <Navbar/>

      {}
      <section className="relative pt-12 pb-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Support Online • Typical response within 2 hours</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Let's Build Your Digital Library
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Have questions about setting up multi-tenant seat maps, pricing plans, or custom library integrations? Send us a message and our team in Bihar will get right back to you.
        </p>
      </section>

      {}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Contact Cards */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LuSparkles className="w-5 h-5 text-blue-400" /> Direct Support Channels
              </h2>

              <div className="space-y-4 text-xs">
                {/* Email Item */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 flex items-start gap-3 group hover:border-slate-700 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                    <LuMail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className=" m-1 text-slate-400 font-mono text-[11px] uppercase">Email Us Directly</div>
                    <a href="mailto:hellobittukumar12@gmail.com" className="text-white font-semibold font-mono text-xs hover:text-blue-400 transition-colors block mt-0.5">
                      hellobittukumar12@gmail.com
                    </a>
                    <div className="text-[10px] text-slate-500 mt-1">For sales inquiries, custom pricing, and technical support.</div>
                  </div>
                </div>

                {/* Location Item */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 flex items-start gap-3 group hover:border-slate-700 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                    <LuMapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-mono text-[11px] uppercase">Operations & Headquarters</div>
                    <div className="text-white font-semibold text-xs mt-0.5">
                      Bihar, India
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Serving study halls and library networks nationwide.</div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 flex items-start gap-3 group hover:border-slate-700 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                    <LuClock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 font-mono text-[11px] uppercase">Working Hours</div>
                    <div className="text-white font-semibold text-xs mt-0.5">
                      Monday – Saturday: 9:00 AM – 8:00 PM IST
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active On WhatsApp & Email
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Assistance Callout */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LuHandHelping  className="w-4 h-4 text-blue-400" /> Need Immediate Onboarding Help?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you already have a library with 50+ seats and need rapid manual onboarding assistance, mention your total seat count in your message.
              </p>
            </div>

          </div>

          {}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">
              
              {isSubmitted ? (
                /* Success Feedback State */
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                    <LuCheckCheck  className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.fullName || 'there'}</strong>. Your message regarding <strong className="text-blue-400">{formData.libraryName || 'your library'}</strong> has been recorded. Our team will email you back shortly at <code className="text-blue-300 font-mono text-xs">{formData.email || 'your email'}</code>.
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                /* Contact Input Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-slate-800 pb-4 space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <LuMessageSquare className="w-5 h-5 text-blue-400" /> Send Us a Message
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Fill out the form below and we will get back to you promptly.
                    </p>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-300 uppercase">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuUser className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Amit Kumar"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-300 uppercase">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <LuMail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@domain.com"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Library Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-300 uppercase">
                        Mobile / WhatsApp Number
                      </label>
                      <div className="relative">
                        <LuPhone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-300 uppercase">
                        Library / Institution Name
                      </label>
                      <div className="relative">
                        <LuBuilding2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.libraryName}
                          onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                          placeholder="Apex Reading Room, Patna"
                          className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Category */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-300 uppercase">
                      Topic / Inquiry Type
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="trial">Free Trial & Onboarding Help</option>
                      <option value="pricing">Custom Seat Pricing & Plans</option>
                      <option value="billing">UPI / Cash Collection Questions</option>
                      <option value="technical">Technical Support / Bug Report</option>
                    </select>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-300 uppercase">
                      Your Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your library setup, total seats, or any specific questions you have..."
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 border border-blue-400/30"
                  >
                    <LuSend className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {}
      <footer className="border-t border-slate-800/80 bg-[#050810] py-8 text-slate-500 text-xs mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div>© {new Date().getFullYear()} Libdesk (www.libdesk.online). Operations in Bihar, India.</div>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            <span>•</span>
            <a href="mailto:hellobittukumar12@gmail.com" className="hover:text-slate-300">hellobittukumar12@gmail.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}