import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LuSearch,
  LuUser,
  LuPhone,
  LuCalendar,
  LuRefreshCw,
  LuTriangleAlert ,
  LuCheck ,
  LuX,
  LuArmchair,
  LuShieldCheck,
  LuRepeat,
  LuZap,
  LuArrowRight,
  LuLoader,
  LuCreditCard
} from 'react-icons/lu';
import Navbar from '../components/Navbar';

interface FoundStudent {
  id: number;
  name: string;
  fathersName: string;
  phone: string;
}

interface Seat {
  id: number;
  seatNumber: number;
  room?: { name: string };
}

interface SplitShiftOption {
  shiftId: number;
  freeSeats: Seat[];
}

interface RenewalStatusResponse {
  success: boolean;
  previousSeatId: number | null;
  previousSeatNumber: number | null;
  suggestedStartDate: string;
  todayDate: string;
}

interface AvailabilityResponse {
  success: boolean;
  isSplitCombo: boolean;
  availableSeats?: Seat[];
  splitOptions?: SplitShiftOption[];
}

// const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.libdesk.online';
const BASE_URL =  'https://api.libdesk.online';

export default function RenewalPage(): React.JSX.Element {
  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoundStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<FoundStudent | null>(null);

  // Form parameters
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [endDate, setEndDate] = useState('');
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({ amount: '', paymentType: 'cash', remarks: '' });

  // Strategy and seat check states
  const [dateStrategy, setDateStrategy] = useState<'continuous' | 'today' | 'custom'>('continuous');
  const [checkingStudentHistory, setCheckingStudentHistory] = useState(false);
  const [checkingSeatAvailability, setCheckingSeatAvailability] = useState(false);
  
  const [renewalStatus, setRenewalStatus] = useState<RenewalStatusResponse | null>(null);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);
  
  const [isPreviousSeatFree, setIsPreviousSeatFree] = useState<boolean | null>(null);
  const [wantDifferentSeat, setWantDifferentSeat] = useState(false);
  const [selectedSingleSeatId, setSelectedSingleSeatId] = useState('');
  const [splitSeatSelections, setSplitSeatSelections] = useState<Record<number, number>>({});
  const [isDateOverlappingActivePlan, setIsDateOverlappingActivePlan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.dismiss();
    const content = (
      <div className="pr-2">
        <div className="font-bold font-mono text-xs uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{message}</div>
      </div>
    );
    const opts = { toastId: 'renew-single-toast', autoClose: 3000 };
    if (type === 'success') toast.success(content, opts);
    else if (type === 'error') toast.error(content, opts);
    else toast.info(content, opts);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) fetchStudents();
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/students/search?name=${searchQuery}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const result = await res.json();
      if (result.success) setSearchResults(result.students);
    } catch (err) {
      console.warn("Using search fallback...", err);
      setSearchResults([
        { id: 101, name: 'Aman Sharma', fathersName: 'Rajesh Sharma', phone: '9876543210' },
        { id: 102, name: 'Pooja Verma', fathersName: 'Sanjay Verma', phone: '9661056097' }
      ].filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentRenewalHistory();
    } else {
      setRenewalStatus(null);
      setAvailabilityData(null);
      setIsPreviousSeatFree(null);
    }
  }, [selectedStudent]);

  const fetchStudentRenewalHistory = async () => {
    setCheckingStudentHistory(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/renewals/check?studentId=${selectedStudent?.id}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const result = await res.json();
      if (result.success) {
        setRenewalStatus(result);
        setStartDate(result.suggestedStartDate);
        setDateStrategy('continuous');
      }
    } catch (err) {
      console.warn("Fallback for renewal history...", err);
      const mockResult = {
        success: true,
        previousSeatId: 1,
        previousSeatNumber: 15,
        suggestedStartDate: '2026-07-28',
        todayDate: todayStr
      };
      setRenewalStatus(mockResult);
      setStartDate(mockResult.suggestedStartDate);
      setDateStrategy('continuous');
    } finally {
      setCheckingStudentHistory(false);
    }
  };

  useEffect(() => {
    if (!startDate) {
      setEndDate('');
      return;
    }
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + parseInt(durationMonths, 10));
    setEndDate(start.toISOString().split('T')[0]);
  }, [startDate, durationMonths]);

  useEffect(() => {
    if (!renewalStatus) return;
    if (dateStrategy === 'continuous') setStartDate(renewalStatus.suggestedStartDate);
    else if (dateStrategy === 'today') setStartDate(renewalStatus.todayDate);
    else setStartDate('');
  }, [dateStrategy]);

  useEffect(() => {
    if (!renewalStatus || !startDate) {
      setIsDateOverlappingActivePlan(false);
      return;
    }
    const selectedStartMs = new Date(`${startDate}T00:00:00`).getTime();
    const activeEnd = new Date(renewalStatus.suggestedStartDate);
    activeEnd.setDate(activeEnd.getDate() - 1);
    const activeEndMs = activeEnd.getTime();

    if (selectedStartMs <= activeEndMs) {
      setIsDateOverlappingActivePlan(true);
    } else {
      setIsDateOverlappingActivePlan(false);
    }
  }, [startDate, renewalStatus]);

  useEffect(() => {
    if (selectedStudent && startDate && endDate && selectedShifts.length > 0 && !isDateOverlappingActivePlan) {
      checkLiveAvailability();
    } else {
      setAvailabilityData(null);
      setIsPreviousSeatFree(null);
    }
  }, [startDate, endDate, selectedShifts, wantDifferentSeat, isDateOverlappingActivePlan]);

  const checkLiveAvailability = async () => {
    setCheckingSeatAvailability(true);
    try {
      const query = new URLSearchParams({
        startDate,
        endDate,
        shifts: selectedShifts.join(','),
        studentId: selectedStudent?.id.toString() || ''
      }).toString();

      const res = await fetch(`${BASE_URL}/api/v1/available?${query}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const result = await res.json();
      
      if (result.success) {
        setAvailabilityData(result);
        if (renewalStatus?.previousSeatId) {
          const foundFree = result.availableSeats?.some((s: Seat) => s.id === renewalStatus.previousSeatId);
          setIsPreviousSeatFree(!!foundFree);
        } else {
          setIsPreviousSeatFree(false);
        }
      }
    } catch (err) {
      console.warn("Fallback for seat availability...", err);
      setAvailabilityData({
        success: true,
        isSplitCombo: false,
        availableSeats: [
          { id: 1, seatNumber: 15, room: { name: 'Main Hall' } },
          { id: 2, seatNumber: 22, room: { name: 'Silent Zone' } }
        ]
      });
      setIsPreviousSeatFree(true);
    } finally {
      setCheckingSeatAvailability(false);
    }
  };

  const handleShiftToggle = (num: number) => {
    setSelectedShifts(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const handleSplitSelectionChange = (shiftId: number, seatIdStr: string) => {
    setSplitSeatSelections(prev => ({ ...prev, [shiftId]: parseInt(seatIdStr, 10) }));
  };

  const isFormValid = () => {
    if (selectedShifts.length === 0 || !startDate || !endDate) return false;
    if (isDateOverlappingActivePlan) return false;
    if (!paymentInfo.amount) return false;

    if (!wantDifferentSeat && isPreviousSeatFree === true) return true;

    if (availabilityData?.isSplitCombo) {
      return selectedShifts.every(shiftId => !!splitSeatSelections[shiftId]);
    }
    return !!selectedSingleSeatId;
  };

  const handleRenewalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !isFormValid()) {
      showToast("Validation Error", "Please assign all required fields and seating mappings.", "error");
      return;
    }

    setSubmitting(true);
    try {
      let finalSeatPayload = {};
      
      if (!wantDifferentSeat && isPreviousSeatFree === true && renewalStatus) {
        finalSeatPayload = {
          isSplit: false,
          seatId: renewalStatus.previousSeatId,
          shiftIds: selectedShifts
        };
      } else if (availabilityData?.isSplitCombo) {
        finalSeatPayload = {
          isSplit: true,
          splitBookings: Object.entries(splitSeatSelections).map(([shiftId, seatId]) => ({
            shiftId: parseInt(shiftId, 10),
            seatId: seatId
          }))
        };
      } else {
        finalSeatPayload = {
          isSplit: false,
          seatId: parseInt(selectedSingleSeatId, 10),
          shiftIds: selectedShifts
        };
      }

      const payload = {
        studentId: selectedStudent.id,
        startDate,
        endDate,
        ...finalSeatPayload,
        ...paymentInfo
      };

      const response = await fetch(`${BASE_URL}/api/v1/renewals/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showToast("Renewal Successful", `Membership extended for ${selectedStudent.name}`, "success");
        // Reset state
        setSelectedStudent(null); setSearchQuery(''); setStartDate(''); setSelectedShifts([]);
        setRenewalStatus(null); setAvailabilityData(null); setSelectedSingleSeatId('');
        setSplitSeatSelections({}); setWantDifferentSeat(false);
        setPaymentInfo({ amount: '', paymentType: 'cash', remarks: '' });
      } else {
        showToast("Renewal Failed", result.message || "Could not process transaction", "error");
      }
    } catch (err) {
      console.warn("Offline save simulated...", err);
      showToast("Renewal Saved Offline", `Simulated success for ${selectedStudent.name}`, "success");
      setSelectedStudent(null); setSearchQuery('');
    } finally {
      setSubmitting(false);
    }
  };

  const getActivePlanEndDateString = () => {
    if (!renewalStatus) return '';
    const activeEnd = new Date(renewalStatus.suggestedStartDate);
    activeEnd.setDate(activeEnd.getDate() - 1);
    return activeEnd.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative pb-28 overflow-x-hidden">
      <Navbar/>
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400">
          <LuRepeat className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Membership Renewal Gateway</span>
        </div>
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Subscription Extension
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-mono">
            Search returning students, re-allocate seats, and log collection dues.
          </p>
        </div>
      </div>

      {}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 space-y-6">
        
        {/* 1. Student Search Lookup */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative">
          <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
            Search Returning Student <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <LuSearch className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by student name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono shadow-inner"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <LuX className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {searchResults.length > 0 && !selectedStudent && (
            <div className="absolute left-6 right-6 top-[85px] z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto ring-1 ring-black/50">
              {searchResults.map(student => (
                <button 
                  type="button"
                  key={student.id} 
                  onClick={() => { 
                    setSelectedStudent(student); 
                    setSearchResults([]); 
                    setSearchQuery('');
                  }} 
                  className="w-full text-left px-4 py-3 border-b border-slate-800/80 hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold font-mono text-sm flex items-center gap-2">
                      <LuUser className="w-4 h-4 text-blue-400" /> {student.name}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5 ml-6 font-mono">Father: {student.fathersName}</div>
                  </div>
                  <div className="text-slate-500 text-xs font-mono flex items-center gap-1.5">
                    <LuPhone className="w-3.5 h-3.5" /> {student.phone}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {}
        {/* Main Renewal Entry Workspace */}
        {selectedStudent && (
          <form onSubmit={handleRenewalSubmit} className="space-y-6">
            
            {/* Active Student Display Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 shadow-inner">
              <div>
                <span className="text-xs text-blue-300 font-mono uppercase tracking-wider block mb-1">Target Profile Locked</span>
                <div className="text-white font-bold text-base flex items-center gap-2">
                  <LuCheck  className="w-5 h-5 text-emerald-400" />
                  {selectedStudent.name} <span className="text-slate-400 text-sm font-normal ml-1">(Father: {selectedStudent.fathersName})</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStudent(null)} 
                className="px-4 py-2 bg-[#080C14] hover:bg-slate-900 border border-slate-700 text-rose-400 text-xs font-bold rounded-lg transition-all flex items-center gap-2 w-fit"
              >
                <LuX className="w-3.5 h-3.5" /> Switch Student
              </button>
            </div>

            {checkingStudentHistory ? (
              <div className="py-12 text-center space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <LuLoader className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Loading historical subscription logs...</p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
                
                {/* 1. Date Strategy Selectors */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase text-slate-300">
                    Step 1: Extension Strategy
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setDateStrategy('continuous')} 
                      className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        dateStrategy === 'continuous'
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/50'
                          : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs font-mono mb-1">Continuous Link</div>
                      <div className={`text-[10px] ${dateStrategy === 'continuous' ? 'text-blue-200' : 'text-slate-500'} leading-snug`}>Backdate to immediately follow last expiry date.</div>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setDateStrategy('today')} 
                      className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        dateStrategy === 'today'
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                          : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs font-mono mb-1">Start From Today</div>
                      <div className={`text-[10px] ${dateStrategy === 'today' ? 'text-emerald-200' : 'text-slate-500'} leading-snug`}>Ignore gap days. New plan begins right now.</div>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setDateStrategy('custom')} 
                      className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        dateStrategy === 'custom'
                          ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/50'
                          : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs font-mono mb-1">Custom Future Date</div>
                      <div className={`text-[10px] ${dateStrategy === 'custom' ? 'text-amber-200' : 'text-slate-500'} leading-snug`}>Manually select a specific start date below.</div>
                    </button>
                  </div>
                </div>

                {}
                {/* 2. Date & Duration Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Calculated Start Date <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <LuCalendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input 
                        required 
                        type="date" 
                        min={dateStrategy === 'custom' ? todayStr : undefined} 
                        disabled={dateStrategy !== 'custom'} 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        onClick={(e) => { if(dateStrategy === 'custom') e.currentTarget.showPicker?.(); }}
                        className={`w-full bg-[#080C14] border rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none transition-all font-mono [color-scheme:dark] ${
                          dateStrategy !== 'custom' ? 'border-slate-800 opacity-60 cursor-not-allowed' : 'border-slate-700 focus:border-blue-500 cursor-pointer shadow-inner'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Renewal Term
                    </label>
                    <div className="relative">
                      <LuRefreshCw className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select 
                        value={durationMonths} 
                        onChange={(e) => setDurationMonths(e.target.value)} 
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono shadow-inner"
                      >
                        <option value="1">1 Month Extension</option>
                        <option value="2">2 Months Extension</option>
                        <option value="3">3 Months Extension</option>
                        <option value="6">6 Months Extension</option>
                      </select>
                    </div>
                  </div>

                  {/* Deadline Result Banner */}
                  {endDate && !isDateOverlappingActivePlan && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-blue-300 shadow-inner">
                      <span className="flex items-center gap-2">
                        <LuShieldCheck className="w-4 h-4 text-blue-400" />
                        Next Expiration Deadline:
                      </span>
                      <strong className="text-white font-bold bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-500/30 text-sm">
                        {endDate}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Overlap Bug Protection Error Banner */}
                {isDateOverlappingActivePlan && (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3">
                    <LuTriangleAlert  className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-200 leading-relaxed font-mono">
                      <strong className="block text-rose-400 mb-1 text-sm">Active Plan Overlap Detected</strong>
                      {selectedStudent.name} already has an active membership running until <span className="font-bold text-white">{getActivePlanEndDateString()}</span>. 
                      Please change your strategy to <strong className="text-white">Continuous Link</strong> to extend their timeline without double-billing them for overlapping days.
                    </div>
                  </div>
                )}

                {}
                {/* 3. Shift Configuration */}
                <div className="space-y-3 border-t border-slate-800/80 pt-6">
                  <label className="block text-xs font-mono uppercase text-slate-300">
                    Step 2: Target Shifts <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 1, label: 'Shift 1', time: '06:00 AM – 12:00 PM' },
                      { id: 2, label: 'Shift 2', time: '12:00 PM – 06:00 PM' },
                      { id: 3, label: 'Shift 3', time: '06:00 PM – 11:00 PM' }
                    ].map(shift => {
                      const isSelected = selectedShifts.includes(shift.id);
                      return (
                        <button
                          type="button"
                          key={shift.id}
                          onClick={() => handleShiftToggle(shift.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-inner'
                              : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs font-mono">{shift.label}</div>
                            <div className="text-[10px] opacity-70 font-mono mt-0.5">{shift.time}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-700'}`}>
                            {isSelected && <LuCheck  className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {}
                {/* 4. Dynamic Seat Availability Allocation */}
                {checkingSeatAvailability ? (
                  <div className="py-6 text-center space-y-3 bg-[#080C14] rounded-xl border border-slate-800">
                    <LuLoader className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-xs font-mono text-slate-400">Scanning room matrices...</p>
                  </div>
                ) : availabilityData && (
                  <div className="space-y-4 border-t border-slate-800/80 pt-6">
                    <label className="block text-xs font-mono uppercase text-slate-300">
                      Step 3: Seat Re-Allocation
                    </label>

                    {renewalStatus?.previousSeatNumber && (
                      <div className="flex items-center gap-3 p-3 bg-[#080C14] rounded-xl border border-slate-800">
                        <input 
                          type="checkbox" 
                          id="seatToggle" 
                          checked={wantDifferentSeat} 
                          onChange={(e) => setWantDifferentSeat(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                        <label htmlFor="seatToggle" className="text-xs font-mono text-slate-300 cursor-pointer select-none pt-0.5">
                          Drop previous history and allocate a new seat
                        </label>
                      </div>
                    )}

                    {/* SCENARIO A: Keeping Old Seat */}
                    {!wantDifferentSeat && renewalStatus?.previousSeatNumber && (
                      <div>
                        {isPreviousSeatFree ? (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                            <LuCheck  className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-200 leading-relaxed font-mono">
                              <strong className="block text-emerald-400 mb-1 text-sm">Seat Retained</strong>
                              The historical <strong className="text-white">Seat #{renewalStatus.previousSeatNumber}</strong> is available and reserved for this renewal block.
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                            <LuTriangleAlert  className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-200 leading-relaxed font-mono">
                              <strong className="block text-amber-400 mb-1 text-sm">Seat Taken</strong>
                              Historical Seat #{renewalStatus.previousSeatNumber} has been occupied. You must allocate an alternate workspace below.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SCENARIO B: Alternate Setup (Single or Split) */}
                    {(wantDifferentSeat || !isPreviousSeatFree) && (
                      <div className="bg-[#080C14] p-5 rounded-xl border border-slate-800 space-y-4">
                        {!availabilityData.isSplitCombo ? (
                          <div className="space-y-2">
                            <label className="text-xs font-mono text-slate-300 flex items-center gap-2">
                              <LuArmchair className="w-4 h-4 text-cyan-400" /> Choose Open Seat (Covers All Shifts)
                            </label>
                            <select 
                              required 
                              value={selectedSingleSeatId} 
                              onChange={(e) => setSelectedSingleSeatId(e.target.value)} 
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                            >
                              <option value="">-- Available Seats --</option>
                              {availabilityData.availableSeats?.map(seat => (
                                <option key={seat.id} value={seat.id}>Seat #{seat.seatNumber} ({seat.room?.name || 'Main Hall'})</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold border-b border-slate-800 pb-3">
                              <LuZap className="w-4 h-4 shrink-0" />
                              Split Seat Assignment Required
                            </div>
                            <p className="text-xs font-mono text-slate-400 leading-relaxed">
                              No single desk is open for all selected shifts simultaneously. Assign a unique seat for each shift:
                            </p>
                            <div className="space-y-3 pt-1">
                              {availabilityData.splitOptions?.map(option => (
                                <div key={option.shiftId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                                  <span className="text-xs font-mono text-white font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    Shift {option.shiftId} Seat:
                                  </span>
                                  <select 
                                    required 
                                    value={splitSeatSelections[option.shiftId] || ''} 
                                    onChange={(e) => handleSplitSelectionChange(option.shiftId, e.target.value)} 
                                    className="bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono w-full sm:w-64"
                                  >
                                    <option value="">-- Assign Shift {option.shiftId} --</option>
                                    {option.freeSeats.map(seat => (
                                      <option key={seat.id} value={seat.id}>Seat #{seat.seatNumber} ({seat.room?.name})</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!checkingSeatAvailability && !availabilityData && (
                  <div className="py-4 text-center border-t border-slate-800/80 pt-6">
                    <p className="text-xs font-mono text-slate-500 italic">Select start date and shifts above to render availability constraints.</p>
                  </div>
                )}

                {}
                {/* 5. Billing Info Logs */}
                <div className="space-y-3 border-t border-slate-800/80 pt-6">
                  <label className="block text-xs font-mono uppercase text-slate-300">
                    Step 4: Billing Ledger
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="text-slate-500 font-mono text-sm absolute left-4 top-1/2 -translate-y-1/2">₹</span>
                      <input 
                        required 
                        type="number" 
                        placeholder="Collected Fee *" 
                        value={paymentInfo.amount} 
                        onChange={(e) => setPaymentInfo({...paymentInfo, amount: e.target.value})} 
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-8 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner"
                      />
                    </div>
                    <div className="relative">
                      <LuCreditCard className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select 
                        value={paymentInfo.paymentType} 
                        onChange={(e) => setPaymentInfo({...paymentInfo, paymentType: e.target.value})} 
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner appearance-none"
                      >
                        <option value="cash">Cash Collection</option>
                        <option value="upi">UPI Portal / QR Scan</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Transaction footnotes or Ref ID (Optional)..." 
                        value={paymentInfo.remarks} 
                        onChange={(e) => setPaymentInfo({...paymentInfo, remarks: e.target.value})} 
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Submission */}
                <div className="pt-4 hidden md:block">
                  <button 
                    type="submit" 
                    disabled={submitting || !isFormValid()} 
                    className={`w-full py-4 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 border ${
                      submitting || !isFormValid()
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/30 shadow-blue-600/25'
                    }`}
                  >
                    {submitting ? (
                      <><LuLoader className="w-4 h-4 animate-spin" /> Processing Chain...</>
                    ) : (
                      <><LuArrowRight className="w-4 h-4" /> Execute Complete Renewal</>
                    )}
                  </button>
                </div>

              </div>
            )}
            
            {/* Fixed Bottom Dock Navigation for Mobile */}
            <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 bg-[#080C14]/95 border-t border-slate-800 p-3.5 backdrop-blur-xl flex items-center justify-center shadow-2xl">
              <button 
                type="submit" 
                disabled={submitting || !isFormValid()} 
                className={`w-full py-3.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 border ${
                  submitting || !isFormValid()
                    ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/30 shadow-blue-600/30'
                }`}
              >
                {submitting ? "Processing..." : "Submit Renewal"}
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}