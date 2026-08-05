import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuWallet,
  LuBanknote,
  LuSmartphone,
  LuTrendingUp,
  LuTrendingDown,
  LuMinus,
  LuCalendarDays,
  LuRefreshCw,
  LuChevronLeft,
  LuChevronRight
} from 'react-icons/lu';

import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface Transaction {
  id: number;
  studentName: string;
  phone: string;
  membershipId: number;
  amount: number;
  type: 'upi' | 'cash';
  date: string;
  remarks: string;
}

interface FinancialData {
  metrics: {
    currentTotal: number;
    upiTotal: number;
    cashTotal: number;
    prevTotal: number;
    percentageChange: number;
    hasPriorData: boolean;
  };
  chartData: Array<{ label: string; total: number }>;
  ledger: Transaction[];
}

const ITEMS_PER_PAGE = 10;

export default function PaymentDashboardPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // <-- Added for 403 redirection

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialData | null>(null);
  
  // Filters
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'upi' | 'cash'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFinances = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/finances?timeframe=${timeframe}`, {
        credentials: 'include',
      });
      const result = await res.json();

      // <-- ADDED 403 AUTHORIZATION CHECK
      if (res.status === 403) {
        toast.error(
          <div>
            <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">Access Denied</div>
            <div className="text-xs text-slate-300 mt-0.5">You are not authorized for this branch.</div>
          </div>
        );
        navigate('/me');
        return;
      }

      if (!res.ok) throw new Error(result.message);
      setData(result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFinances();
  }, [id, timeframe]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe, paymentFilter]);

  // Apply Method Filter
  const filteredLedger = data?.ledger.filter((t) => 
    paymentFilter === 'all' ? true : t.type === paymentFilter
  ) || [];

  // Apply Pagination Math
  const totalPages = Math.ceil(filteredLedger.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLedgerPage = filteredLedger.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Chart Setup - Find Max Value for dynamic heights
  const maxChartValue = data?.chartData.reduce((max, d) => Math.max(max, d.total), 0) || 1;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-emerald-600 selection:text-white flex font-mono">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-emerald-600/10 via-teal-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* SIDEBAR */}
      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName="Financials"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              Revenue Engine
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
              Payment Dashboard
            </h1>
          </div>

          {/* TIMEFRAME FILTERS */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
            {(['today', 'week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                  timeframe === t
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LuRefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : !data ? null : (
          <div className="space-y-6">
            
            {/* METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* TOTAL REVENUE */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                    <LuWallet className="w-6 h-6" />
                  </div>
                  
                  {/* PERCENTAGE BADGE - HANDLING "NO PRIOR DATA" */}
                  {!data.metrics.hasPriorData ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold">
                      <LuMinus className="w-3 h-3" /> No prior data
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      data.metrics.percentageChange >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {data.metrics.percentageChange >= 0 ? <LuTrendingUp className="w-3 h-3" /> : <LuTrendingDown className="w-3 h-3" />}
                      {Math.abs(data.metrics.percentageChange).toFixed(1)}% vs prev
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</h3>
                  <div className="text-3xl font-extrabold text-white">₹{data.metrics.currentTotal.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* UPI PAYMENTS */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
                    <LuSmartphone className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Online (UPI)</h3>
                  <div className="text-2xl font-extrabold text-white">₹{data.metrics.upiTotal.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* CASH PAYMENTS */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
                    <LuBanknote className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Physical Cash</h3>
                  <div className="text-2xl font-extrabold text-white">₹{data.metrics.cashTotal.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* TAILWIND CSS REVENUE CHART */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-8">
                <LuTrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Revenue Timeline</h2>
              </div>
              
              {data.chartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No transactions in this period.</div>
              ) : (
                <div className="h-48 flex items-end justify-between gap-1 sm:gap-2">
                  {data.chartData.map((point, idx) => {
                    // Calculate height percentage (min 5% so it's visible)
                    const heightPercent = Math.max((point.total / maxChartValue) * 100, 5);
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="w-full relative flex justify-center items-end h-36">
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 border border-slate-700 text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            ₹{point.total}
                          </div>
                          <div 
                            className="w-full max-w-[40px] bg-emerald-500/20 group-hover:bg-emerald-500/40 border-t border-emerald-500/50 rounded-t-sm transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 mt-3 truncate w-full text-center">
                          {point.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TRANSACTION LEDGER TABLE WITH PAGINATION */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <LuCalendarDays className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Transaction Ledger</h2>
                </div>
                
                {/* Method Filter */}
                <div className="flex bg-[#080C14] border border-slate-800 rounded-lg p-1">
                   {(['all', 'upi', 'cash'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentFilter(method)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                        paymentFilter === method
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#080C14]/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {currentLedgerPage.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No transactions found for this filter.
                        </td>
                      </tr>
                    ) : (
                      currentLedgerPage.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{tx.studentName}</div>
                            <div className="text-[10px] text-slate-500">{tx.phone} • Mem #{tx.membershipId}</div>
                          </td>
                          <td className="px-6 py-4">
                            {tx.type === 'upi' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/20 font-bold uppercase">
                                <LuSmartphone className="w-3 h-3" /> UPI
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20 font-bold uppercase">
                                <LuBanknote className="w-3 h-3" /> Cash
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            <span className="ml-2 text-slate-600 text-[10px]">
                              {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-400">
                            +₹{tx.amount.toLocaleString('en-IN')}
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
                    Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredLedger.length)} of {filteredLedger.length}
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
            
          </div>
        )}
      </main>
    </div>
  );
}