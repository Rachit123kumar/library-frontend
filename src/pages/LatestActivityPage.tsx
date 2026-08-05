import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuActivity,
//   LuCalendarDays,
  LuBanknote,
  LuSmartphone,
  LuRefreshCw,
  LuChevronLeft,
  LuChevronRight,
  LuUser
} from 'react-icons/lu';

import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface LatestMembership {
  id: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  student: {
    name: string;
    fathersName: string;
    phone: string;
  };
  payments: Array<{
    amount: number;
    paymentType: 'upi' | 'cash';
    paidAt: string;
  }>;
}

interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function LatestActivityPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [memberships, setMemberships] = useState<LatestMembership[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const fetchLatestActivity = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/memberships/latest?page=${page}&limit=10`, {
        credentials: 'include',
      });
      const result = await res.json();
      
      if (res.status === 403) {
        toast.error('Access Denied. You are not authorized for this branch.');
        navigate('/me');
        return;
      }
      if (!res.ok) throw new Error(result.message);
      
      setMemberships(result.data.memberships);
      setPagination(result.data.pagination);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLatestActivity(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pagination.currentPage]);

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-indigo-600 selection:text-white flex font-mono">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName="Activity Log"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
              Audit Engine
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
              Latest Memberships
            </h1>
          </div>
          <button
            onClick={() => fetchLatestActivity(pagination.currentPage)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Refresh Data"
          >
            <LuRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/50">
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <LuActivity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Recent Admissions & Renewals</h2>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading && memberships.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <LuRefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#080C14]/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Processed On</th>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4">Membership Dates</th>
                    <th className="px-6 py-4 text-right">Payment Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {memberships.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No activity found.
                      </td>
                    </tr>
                  ) : (
                    memberships.map((m) => {
                      const payment = m.payments[0]; // Assuming 1 payment record returned
                      return (
                        <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Created At Date */}
                          <td className="px-6 py-4 text-slate-400">
                            <div className="font-bold text-white">
                              {new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* Student Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                              <LuUser className="w-3.5 h-3.5 text-slate-500" />
                              {m.student.name}
                            </div>
                            <div className="text-[10px] text-slate-400">D/O, S/O: {m.student.fathersName}</div>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">{m.student.phone}</div>
                          </td>

                          {/* Membership Cycle */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-8 text-[10px] text-slate-500 uppercase font-bold">Start</span>
                              <span className="text-white bg-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                                {new Date(m.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-8 text-[10px] text-slate-500 uppercase font-bold">End</span>
                              <span className="text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] border border-indigo-500/20 font-bold">
                                {new Date(m.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </td>

                          {/* Payment Collected */}
                          <td className="px-6 py-4 text-right">
                            {payment ? (
                              <>
                                <div className="text-sm font-extrabold text-emerald-400 mb-1">
                                  +₹{payment.amount.toLocaleString('en-IN')}
                                </div>
                                {payment.paymentType === 'upi' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] border border-cyan-500/20 font-bold uppercase tracking-wider">
                                    <LuSmartphone className="w-3 h-3" /> UPI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] border border-amber-500/20 font-bold uppercase tracking-wider">
                                    <LuBanknote className="w-3 h-3" /> Cash
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">No Payment Linked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* SERVER-SIDE PAGINATION CONTROLS */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/30">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1 || loading}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-white px-2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}