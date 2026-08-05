import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuClock,
  LuTriangleAlert,
  LuCalendarDays,
  LuCopy,
  LuRefreshCw,
  LuMessageCircle,
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight
} from 'react-icons/lu';

import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface MembershipAlert {
  id: number;
  startDate: string;
  endDate: string;
  student: {
    id: number;
    name: string;
    fathersName: string;
    phone: string;
  };
  bookings: Array<{
    seat: { seatNumber: number; room: { name: string } };
    shift: { name: string };
  }>;
}

const ITEMS_PER_PAGE = 10;

export default function ExpiringDashboardPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'3days' | '7days' | 'expired'>('3days');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  const [data, setData] = useState<{
    expired: MembershipAlert[];
    in3Days: MembershipAlert[];
    in7Days: MembershipAlert[];
  }>({ expired: [], in3Days: [], in7Days: [] });

  const fetchExpiring = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/memberships/expiring`, {
        credentials: 'include',
      });
      const result = await res.json();
      
      if (res.status === 403) {
        toast.error('Access Denied. You are not authorized for this branch.');
        navigate('/me');
        return;
      }
      if (!res.ok) throw new Error(result.message);
      
      setData(result.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchExpiring();
  }, [id]);

  // Reset pagination to page 1 whenever the tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Action Helpers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${text} to clipboard!`);
  };

  const sendWhatsApp = (studentName: string, phone: string, endDate: string) => {
    const formattedDate = new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const message = `Hello ${studentName}, your library membership is expiring on ${formattedDate}. Please renew your membership to keep your seat reserved. Thank you!`;
    
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // 1. Get the full list for the active tab
  const currentList = activeTab === '3days' ? data.in3Days : activeTab === '7days' ? data.in7Days : data.expired;

  // 2. Apply Pagination Math
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPaginatedList = currentList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-amber-600 selection:text-white flex font-mono">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-amber-600/10 via-orange-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName="Retention"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 uppercase font-bold tracking-wider">
              Retention Engine
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
              Membership Expirations
            </h1>
          </div>
        </div>

        {/* TABS CONTROLLER */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveTab('3days')}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center sm:items-start ${
              activeTab === '3days' ? 'bg-orange-600/10 border-orange-500/40 text-orange-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <LuClock className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Expiring in 0-3 Days</span>
            </div>
            <span className="text-2xl font-extrabold text-white">{data.in3Days.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('7days')}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center sm:items-start ${
              activeTab === '7days' ? 'bg-amber-600/10 border-amber-500/40 text-amber-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <LuCalendarDays className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Expiring in 4-7 Days</span>
            </div>
            <span className="text-2xl font-extrabold text-white">{data.in7Days.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('expired')}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center sm:items-start ${
              activeTab === 'expired' ? 'bg-rose-600/10 border-rose-500/40 text-rose-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <LuTriangleAlert className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Already Expired</span>
            </div>
            <span className="text-2xl font-extrabold text-white">{data.expired.length}</span>
          </button>
        </div>

        {/* DATA TABLE */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LuRefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#080C14]/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4">Seat / Shift</th>
                    <th className="px-6 py-4">Membership Cycle</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {currentPaginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No students found in this category. Great job!
                      </td>
                    </tr>
                  ) : (
                    currentPaginatedList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Student Name & Phone */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">{m.student.name}</div>
                          <div className="text-[10px] text-slate-400 mb-1">D/O, S/O: {m.student.fathersName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-300 font-mono">{m.student.phone}</span>
                            <button 
                              onClick={() => copyToClipboard(m.student.phone)}
                              className="text-slate-500 hover:text-blue-400 transition-colors"
                              title="Copy Phone Number"
                            >
                              <LuCopy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Seat Assignments */}
                        <td className="px-6 py-4">
                          {m.bookings.length > 0 ? (
                            <div className="space-y-1">
                              {m.bookings.map((b, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold bg-slate-800/50 w-fit px-2 py-0.5 rounded-md text-slate-300 border border-slate-700">
                                  <span>{b.seat.room.name}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-cyan-400">Seat {b.seat.seatNumber}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-amber-200">{b.shift.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[10px]">Floating Member</span>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4">
                          <div className="text-slate-400">
                            Start: <span className="text-white">{new Date(m.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="text-slate-400 mt-1">
                            End: <span className={`font-bold ${activeTab === 'expired' ? 'text-rose-400' : 'text-orange-400'}`}>
                              {new Date(m.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => sendWhatsApp(m.student.name, m.student.phone, m.endDate)}
                              className="px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-lg flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                              <LuMessageCircle className="w-4 h-4" /> Message
                            </button>
                            
                            <button
                              onClick={() => navigate(`/library/${id}`)}
                              className="px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                              <LuArrowRight className="w-4 h-4" /> Renew
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/30">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, currentList.length)} of {currentList.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <LuChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-white px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <LuChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}