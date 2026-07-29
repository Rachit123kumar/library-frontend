

import { useState, useEffect, useMemo } from 'react';
import { toast,  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LuClock,
  LuDelete ,
  LuPhone,
  LuSend,
  LuRefreshCw,
  LuSearch,
  LuX,
  LuCalendar,
  LuUser,
  LuArmchair,
  // LuChevronsRight ,
  LuShieldCheck,
  LuBookOpen,
  // LuBuilding2,
  LuRepeat,
  LuZap,
  // LuFilter
} from 'react-icons/lu';

export interface ExpirationRecord {
  id: number;
  studentName: string;
  phone: string;
  fathersName: string;
  seatInfo: string;
  shifts: number[];
  endDate: string;
  statusLabel: string;
  isExpired: boolean;
  duesAmount?: number;
}

const BASE_URL =  'https://api.libdesk.online';
// const BASE_URL = import.meta.env?.VITE_API_URL || 'https://api.libdesk.online';

const SAMPLE_EXPIRATIONS: ExpirationRecord[] = [
  {
    id: 101,
    studentName: 'Vikram Singh',
    phone: '9812345678',
    fathersName: 'Mahendra Singh',
    seatInfo: 'Room 1 • Seat S-02',
    shifts: [1, 2],
    endDate: '2026-07-28',
    statusLabel: 'Expires Today',
    isExpired: false,
    duesAmount: 800
  },
  {
    id: 102,
    studentName: 'Ananya Gupta',
    phone: '9876512340',
    fathersName: 'Sanjay Gupta',
    seatInfo: 'Room 3 • Seat S-15',
    shifts: [1, 2, 3],
    endDate: '2026-07-25',
    statusLabel: 'Expired 3 Days Ago',
    isExpired: true,
    duesAmount: 1200
  },
  {
    id: 103,
    studentName: 'Siddharth Rao',
    phone: '9988776655',
    fathersName: 'Ramesh Rao',
    seatInfo: 'Room 1 • Seat S-08',
    shifts: [3],
    endDate: '2026-07-30',
    statusLabel: 'Expires in 2 Days',
    isExpired: false,
    duesAmount: 800
  },
  {
    id: 104,
    studentName: 'Pooja Verma',
    phone: '9661056097',
    fathersName: 'Sanjay Verma',
    seatInfo: 'Room 2 • Seat S-22',
    shifts: [2],
    endDate: '2026-07-24',
    statusLabel: 'Expired 4 Days Ago',
    isExpired: true,
    duesAmount: 700
  }
];

export default function ExpirationsPage(): React.JSX.Element {
  const [range, setRange] = useState<'3days' | '7days'>('3days');
  const [records, setRecords] = useState<ExpirationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadExpirations();
  }, [range]);

 const showToast = (
  title: string,
  message: string,
  type: "success" | "info" | "error" = "info"
) => {
  const content = (
    <div>
      <div className="font-bold text-xs uppercase tracking-wide">
        {title}
      </div>
      <div className="text-xs mt-1">
        {message}
      </div>
    </div>
  );

  toast.dismiss();

  toast(content, {
    toastId: "expire-single-toast",
    type,
    autoClose: 3000,
  });
};

  const loadExpirations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/expirations?range=${range}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.expirations)) {
        setRecords(result.expirations);
        showToast('Data Synchronized', `Loaded ${result.expirations.length} expiration records`, 'success');
      } else {
        setRecords(SAMPLE_EXPIRATIONS);
      }
    } catch (err) {
      console.warn("Using local expiration fallback dataset:", err);
      setRecords(SAMPLE_EXPIRATIONS);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.fathersName.toLowerCase().includes(q) ||
      r.seatInfo.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  const stats = useMemo(() => {
    const totalCount = records.length;
    const expiredCount = records.filter(r => r.isExpired).length;
    const upcomingCount = records.filter(r => !r.isExpired).length;
    const totalDues = records.reduce((acc, curr) => acc + (curr.duesAmount || 800), 0);
    return { totalCount, expiredCount, upcomingCount, totalDues };
  }, [records]);

  const triggerWhatsAppReminder = (student: ExpirationRecord) => {
    const text = encodeURIComponent(
      `Hello ${student.studentName}, your Libdesk library reservation (${student.seatInfo}) ${student.isExpired ? 'has expired' : 'is expiring soon'} on ${student.endDate}. Please renew your membership to continue using your desk.`
    );
    window.open(`https://wa.me/91${student.phone}?text=${text}`, '_blank');
    showToast('WhatsApp Triggered', `Opened reminder chat for ${student.studentName}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative pb-20 overflow-x-hidden">
      
      {/* Toastify Top Right Container */}
    

      {/* Grid Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-b from-rose-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C14]/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20 ring-1 ring-white/20">
              <LuBookOpen className="w-5 h-5" />
            </div>
            <div>
              <a href="/" className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 hover:text-blue-400 transition-colors">
                Libdesk <span className="text-rose-400 font-semibold">Expirations</span>
              </a>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono hidden sm:inline-block">
                Membership Validity Engine
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-300">
            <a href="/" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">Home</a>
            <a href="/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">Dashboard</a>
            <a href="/admission" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">Admission</a>
            <a href="/expire" className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">Expire</a>
            <a href="/renew" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">Renew</a>
          </nav>

          <button
            onClick={loadExpirations}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reload Records"
          >
            <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Page Title & Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400 mb-2">
              <LuDelete  className="w-3.5 h-3.5" />
              <span>Real-Time Renewal Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Membership Expiration Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Track upcoming renewals, issue 1-click WhatsApp alerts, and collect pending dues.
            </p>
          </div>

          <a
            href="/renew"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all border border-blue-400/30 shrink-0"
          >
            <LuRepeat className="w-4 h-4" />
            <span>Process Renewal</span>
          </a>
        </div>

        {}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Total Flagged</span>
              <LuCalendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">{stats.totalCount}</div>
            <div className="mt-1 text-[10px] text-slate-400 font-mono">Accounts In Window</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Already Expired</span>
              <LuDelete  className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-rose-400 font-mono">{stats.expiredCount}</div>
            <div className="mt-1 text-[10px] text-rose-400/90 font-mono">Requires Action</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Expiring Soon</span>
              <LuClock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-400 font-mono">{stats.upcomingCount}</div>
            <div className="mt-1 text-[10px] text-amber-400/90 font-mono">Send Advance Reminder</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Est. Pending Dues</span>
              <LuZap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono">₹{stats.totalDues}</div>
            <div className="mt-1 text-[10px] text-slate-400 font-mono">Total Renewal Potential</div>
          </div>
        </div>

        {}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-[#080C14] border border-slate-800 rounded-xl w-full md:w-auto font-mono text-xs">
              <button
                onClick={() => setRange('3days')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  range === '3days'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LuDelete  className="w-3.5 h-3.5" />
                <span>3-Day Urgency View</span>
              </button>
              <button
                onClick={() => setRange('7days')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  range === '7days'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LuCalendar className="w-3.5 h-3.5" />
                <span>7-Day Weekly Projection</span>
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <LuSearch className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, seat, phone..."
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <LuX className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>
        </div>

        {}
        {loading ? (
          /* Responsive Skeleton Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-5 w-20 bg-slate-800 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-40 bg-slate-800/80 rounded" />
                  <div className="h-3 w-48 bg-slate-800/60 rounded" />
                  <div className="h-3 w-28 bg-slate-800/60 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                  <div className="h-8 w-24 bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Empty Records Fallback */
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs text-slate-400">
            <LuShieldCheck className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="text-white font-bold text-sm">All Clear!</p>
            <p>No active or recently expired student memberships found for this range selection.</p>
          </div>
        ) : (
          /* Live Expiration Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((student) => (
              <div
                key={student.id}
                className={`bg-slate-900/60 border rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden group ${
                  student.isExpired
                    ? 'border-rose-500/40 hover:border-rose-500/70'
                    : 'border-amber-500/30 hover:border-amber-500/60'
                }`}
              >
                {/* Visual Top Glow Pill */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    student.isExpired ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                />

                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                        <LuUser className="w-3.5 h-3.5 text-slate-400" />
                        {student.studentName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Father: {student.fathersName || 'N/A'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider shrink-0 ${
                        student.isExpired
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {student.statusLabel}
                    </span>
                  </div>

                  {/* Location & Shift Details */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-300">
                      <LuArmchair className="w-3.5 h-3.5 text-blue-400" />
                      <span>{student.seatInfo}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <LuClock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Shifts: {student.shifts.map(s => `Shift ${s}`).join(', ')}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Expected Due:</span>
                      <strong className="text-emerald-400 font-extrabold">₹{student.duesAmount || 800}</strong>
                    </div>
                  </div>
                </div>

                {}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="text-[10px] text-slate-500">
                    <div>{student.isExpired ? 'Expired:' : 'Deadline:'}</div>
                    <strong className="text-white font-bold">{student.endDate}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Call Button */}
                    <a
                      href={`tel:${student.phone}`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title={`Call ${student.phone}`}
                    >
                      <LuPhone className="w-3.5 h-3.5" />
                    </a>

                    {/* WhatsApp Reminder Button */}
                    <button
                      type="button"
                      onClick={() => triggerWhatsAppReminder(student)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <LuSend className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}