import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuSearch, LuArrowLeft, LuRefreshCw, LuGrid2X2, LuCheck, 
  LuUserCog, LuUsers, LuChevronLeft, LuChevronRight, LuCalendar, LuCheckCheck
} from 'react-icons/lu';
import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

export default function SeatManagementPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [library, setLibrary] = useState<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Floating Members State
  const [floatingMembers, setFloatingMembers] = useState<any[]>([]);
  const [floatingPagination, setFloatingPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [loadingFloating, setLoadingFloating] = useState(false);

  // Reassignment State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // MULTI-SHIFT Selection
  const [selectedShiftIds, setSelectedShiftIds] = useState<number[]>([]);
  const [checkingSeats, setCheckingSeats] = useState(false);
  const [hasContinuousSeat, setHasContinuousSeat] = useState(false);
  const [continuousSeats, setContinuousSeats] = useState<any[]>([]);
  const [availabilityPerShift, setAvailabilityPerShift] = useState<Record<number, any[]>>({});
  
  // The map of shiftId -> seatId
  const [chosenAllocations, setChosenAllocations] = useState<Record<number, number>>({});
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLibraryDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setLibrary(data.library);
    } catch (err: any) {}
  };

  const fetchFloatingMembers = async (page = 1) => {
    try {
      setLoadingFloating(true);
      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}/floating-members?page=${page}&limit=5`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        const formatted = data.data.memberships.map((m: any) => ({ ...m.student, memberships: [m] }));
        setFloatingMembers(formatted);
        setFloatingPagination(data.data.pagination);
      }
    } catch (err: any) {} finally {
      setLoadingFloating(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLibraryDetails();
      fetchFloatingMembers(1);
    }
  }, [id]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await fetch(`${BASE_URL}/api/v1/renewals/${id}/renewals/search?query=${searchQuery}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      const activeStudents = data.students.filter((s: any) => {
        const lastM = s.memberships?.[0];
        return lastM && new Date(lastM.endDate) >= new Date(new Date().setHours(0,0,0,0));
      });
      
      setSearchResults(activeStudents);
      if (activeStudents.length === 0) toast.info("No active memberships found for this search.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleShift = (shiftId: number) => {
    setChosenAllocations({}); // reset allocations if shifts change
    setAvailableSeatsArraysEmpty();
    if (selectedShiftIds.includes(shiftId)) {
      setSelectedShiftIds(selectedShiftIds.filter(id => id !== shiftId));
    } else {
      setSelectedShiftIds([...selectedShiftIds, shiftId]);
    }
  };

  const setAvailableSeatsArraysEmpty = () => {
    setContinuousSeats([]);
    setAvailabilityPerShift({});
  };

  const handleCheckSeats = async () => {
    if (selectedShiftIds.length === 0 || !selectedStudent) return;
    const membership = selectedStudent.memberships[0];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const mStart = new Date(membership.startDate);
    const effectiveStart = mStart > today ? mStart : today;

    try {
      setCheckingSeats(true);
      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}/admissions/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startDate: effectiveStart.toISOString().split('T')[0],
          endDate: new Date(membership.endDate).toISOString().split('T')[0],
          shiftIds: selectedShiftIds
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setHasContinuousSeat(data.hasContinuousSeat);
      setContinuousSeats(data.continuousSeats || []);
      setAvailabilityPerShift(data.availabilityPerShift || {});

      // Auto-select first continuous if available
      if (data.hasContinuousSeat && data.continuousSeats.length > 0) {
        const targetSeat = data.continuousSeats[0].id;
        const initialAlloc: Record<number, number> = {};
        selectedShiftIds.forEach(sId => initialAlloc[sId] = targetSeat);
        setChosenAllocations(initialAlloc);
      }
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingSeats(false);
    }
  };

  const handleSubmitReassignment = async () => {
    const allocationsArray = Object.entries(chosenAllocations).map(([sId, seatId]) => ({
      shiftId: parseInt(sId, 10),
      seatId
    }));

    if (allocationsArray.length !== selectedShiftIds.length || !remarks) {
      return toast.error("Please assign a seat for EVERY selected shift and provide a reason.");
    }
    
    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}/seat-management`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          membershipId: selectedStudent.memberships[0].id,
          allocations: allocationsArray,
          remarks
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success(data.message);
      navigate(`/library/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasBookings = selectedStudent?.memberships[0]?.bookings?.length > 0;
  const isAvailableChecked = continuousSeats.length > 0 || Object.keys(availabilityPerShift).length > 0;

  return (
    <div className="min-h-screen pb-7 bg-[#080C14] text-slate-100 font-sans flex selection:bg-purple-600">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[380px] bg-gradient-to-b from-purple-600/15 via-fuchsia-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <LibrarySidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 relative z-10 space-y-6">
        {/* Header */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 sm:p-6 backdrop-blur-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 uppercase font-bold tracking-wider">Operational Adjustments</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">Seat Management</h1>
          </div>
          <button 
            onClick={() => navigate(`/library/${id}`)} 
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-bold text-xs uppercase rounded-xl border border-slate-700/50 flex items-center justify-center gap-2 transition-all"
          >
            <LuArrowLeft className="w-4 h-4 text-purple-400" /> Back
          </button>
        </div>

        {!selectedStudent ? (
          <div className="space-y-6">
            
            {/* FLOATING MEMBERS QUEUE - REPLACED TABLE WITH RESPONSIVE CARDS */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl overflow-hidden shadow-lg backdrop-blur-xl">
              <div className="p-4 sm:p-6 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm sm:text-base font-bold flex items-center gap-2"><LuUsers className="text-purple-400 w-5 h-5" /> Floating Members Queue</h2>
                <span className="self-start sm:self-auto text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-1 rounded uppercase font-bold tracking-wider">Requires Seat Assignment</span>
              </div>
              
              <div className="min-h-[150px] p-4 sm:p-6 bg-[#080C14]/30">
                {loadingFloating ? (
                  <div className="flex justify-center items-center h-32"><LuRefreshCw className="w-6 h-6 text-purple-400 animate-spin" /></div>
                ) : floatingMembers.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                    <LuCheckCheck className="w-8 h-8 mb-2 opacity-50" />
                    No floating members. Everyone has a seat!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {floatingMembers.map(std => (
                      <div key={std.id} className="bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                        <div className="space-y-2">
                          <div className="font-bold text-white text-sm flex items-center flex-wrap gap-2">
                            {std.name} 
                            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">ID #{std.memberships[0].id}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Father: {std.fathersName}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Phone: {std.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300 text-[11px] bg-[#080C14] w-fit px-2 py-1 rounded-md border border-slate-800">
                            <LuCalendar className="w-3.5 h-3.5 text-purple-400" />
                            {new Date(std.memberships[0].startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})} - 
                            <span className="text-emerald-400 font-bold ml-1">{new Date(std.memberships[0].endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedStudent(std)} 
                          className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-purple-600/10 hover:bg-purple-600/20 active:scale-[0.98] text-purple-400 text-xs font-bold rounded-xl border border-purple-500/30 uppercase tracking-wider transition-all"
                        >
                          Assign Seat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {floatingPagination.totalPages > 1 && (
                <div className="p-3 sm:p-4 border-t border-slate-800 flex justify-center sm:justify-end items-center bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => fetchFloatingMembers(floatingPagination.currentPage - 1)} disabled={floatingPagination.currentPage === 1} className="p-2 bg-slate-800 active:scale-[0.95] disabled:opacity-50 disabled:active:scale-100 rounded-lg transition-all"><LuChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-bold font-mono px-2">{floatingPagination.currentPage} / {floatingPagination.totalPages}</span>
                    <button onClick={() => fetchFloatingMembers(floatingPagination.currentPage + 1)} disabled={floatingPagination.currentPage === floatingPagination.totalPages} className="p-2 bg-slate-800 active:scale-[0.95] disabled:opacity-50 disabled:active:scale-100 rounded-lg transition-all"><LuChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>

            {/* GENERAL SEARCH FOR REASSIGNMENT */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 sm:p-8 space-y-6 shadow-lg backdrop-blur-xl">
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2"><LuSearch className="text-purple-400 w-5 h-5"/> Reassign Existing Seat</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search by Name, Phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 sm:py-3.5 text-sm focus:border-purple-500 outline-none transition-colors"
                />
                <button 
                  onClick={handleSearch} 
                  disabled={searching} 
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  {searching ? <LuRefreshCw className="animate-spin w-4 h-4" /> : <LuSearch className="w-4 h-4" />} Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  {searchResults.map((std) => (
                    <div 
                      key={std.id} 
                      onClick={() => setSelectedStudent(std)} 
                      className="bg-[#080C14] border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer active:scale-[0.99] transition-all"
                    >
                      <div>
                        <div className="font-bold flex items-center flex-wrap gap-2 text-sm">
                          {std.name} 
                          <span className="text-purple-400 font-mono text-[9px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Mem #{std.memberships[0].id}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{std.phone}</div>
                      </div>
                      <button className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] uppercase font-bold rounded-xl transition-all">
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-lg backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Selected Student Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 sm:pb-5 gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold flex items-center flex-wrap gap-2 text-white">
                  {selectedStudent.name} 
                  {!hasBookings && <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">Floating Member</span>}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 bg-[#080C14] inline-block px-2.5 py-1 rounded-md border border-slate-800">
                  Membership #{selectedStudent.memberships[0].id} <span className="mx-1">•</span> Ends {new Date(selectedStudent.memberships[0].endDate).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedStudent(null); setSelectedShiftIds([]); setAvailableSeatsArraysEmpty(); }} 
                className="text-[10px] text-slate-400 hover:text-purple-400 bg-slate-800 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-md sm:rounded-none font-bold uppercase tracking-wider transition-colors self-end sm:self-auto"
              >
                Cancel Selection
              </button>
            </div>

            {/* MULTI-SHIFT SELECTION */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {hasBookings ? "Select shifts to change seats for:" : "Select shifts to assign to this member:"}
                </label>
                {hasBookings && selectedStudent.memberships[0].bookings.length > 1 && (
                  <button 
                    onClick={() => setSelectedShiftIds(selectedStudent.memberships[0].bookings.map((b: any) => b.shiftId))} 
                    className="text-[10px] uppercase text-purple-400 font-bold bg-purple-500/10 hover:bg-purple-500/20 active:scale-[0.98] border border-purple-500/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Select All Booked Shifts
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {hasBookings ? (
                  // Changing Seat -> Show their booked shifts
                  selectedStudent.memberships[0].bookings.map((b: any) => {
                    const isSelected = selectedShiftIds.includes(b.shiftId);
                    return (
                      <button
                        key={b.shiftId}
                        onClick={() => toggleShift(b.shiftId)}
                        className={`p-4 sm:p-5 rounded-2xl border text-left active:scale-[0.98] transition-all duration-200 ${
                          isSelected ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-[#080C14] border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="font-bold text-sm">{b.shift.name}</div>
                          {isSelected && <LuCheck className="text-purple-400 w-5 h-5 drop-shadow-md" />}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Current: <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded ml-1 font-mono">Seat #{b.seat?.seatNumber}</span>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  // Floating Member -> Show all library shifts to pick from
                  library?.shifts?.map((shift: any) => {
                    const isSelected = selectedShiftIds.includes(shift.id);
                    return (
                      <button
                        key={shift.id}
                        onClick={() => toggleShift(shift.id)}
                        className={`p-4 sm:p-5 rounded-2xl border text-left active:scale-[0.98] transition-all duration-200 ${
                          isSelected ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-[#080C14] border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="font-bold text-sm">{shift.name}</div>
                          {isSelected && <LuCheck className="text-purple-400 w-5 h-5 drop-shadow-md" />}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          {shift.startTime} <LuArrowLeft className="w-3 h-3 rotate-180" /> {shift.endTime}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {selectedShiftIds.length > 0 && (
              <button 
                onClick={handleCheckSeats} 
                disabled={checkingSeats} 
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-lg"
              >
                {checkingSeats ? <LuRefreshCw className="animate-spin text-purple-400 w-5 h-5" /> : <LuGrid2X2 className="text-purple-400 w-5 h-5" />} 
                Find Available Seats for Selected Shifts
              </button>
            )}

            {/* SEAT AVAILABILITY MATRIX */}
            {isAvailableChecked && (
              <div className="space-y-6 pt-6 border-t border-slate-800/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {hasContinuousSeat ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl flex items-start gap-3 shadow-inner">
                      <LuCheckCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-wide">Continuous Single Seat Available</div>
                        <div className="text-[11px] sm:text-xs text-emerald-400/70 mt-1">Select one seat below to assign across all {selectedShiftIds.length} chosen shift(s):</div>
                      </div>
                    </div>

                    <div className="bg-[#080C14] border border-slate-800/80 p-4 sm:p-6 rounded-2xl shadow-inner">
                      <div className="max-h-64 overflow-y-auto grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 custom-scrollbar pr-1 sm:pr-2">
                        {continuousSeats.map(seat => {
                          const isSelected = selectedShiftIds.every(sId => chosenAllocations[sId] === seat.id);
                          return (
                            <button
                              key={seat.id}
                              onClick={() => {
                                const newAlloc: Record<number, number> = {};
                                selectedShiftIds.forEach(sId => newAlloc[sId] = seat.id);
                                setChosenAllocations(newAlloc);
                              }}
                              className={`p-3 sm:p-4 rounded-2xl border text-center active:scale-95 transition-all duration-200 flex flex-col items-center justify-center min-h-[80px] ${
                                isSelected ? 'bg-purple-600 border-purple-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.4)] scale-105 z-10' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                              }`}
                            >
                              <div className="font-bold text-lg sm:text-xl font-mono">#{seat.seatNumber}</div>
                              <div className="text-[9px] uppercase tracking-wider mt-1 truncate w-full px-1 opacity-70">{seat.roomName}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 rounded-2xl flex items-start gap-3 shadow-inner">
                      <LuGrid2X2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wide">Split Seats Required</div>
                        <div className="text-[11px] sm:text-xs text-amber-400/70 mt-1">No single continuous seat is free. Please select a separate seat for each shift:</div>
                      </div>
                    </div>

                    {selectedShiftIds.map(sId => {
                      const shiftName = library?.shifts?.find((s:any) => s.id === sId)?.name || 'Shift';
                      const avail = availabilityPerShift[sId] || [];
                      return (
                        <div key={sId} className="bg-[#080C14] border border-slate-800/80 p-4 sm:p-6 rounded-2xl space-y-4 shadow-inner">
                          <div className="text-xs font-bold text-purple-400 uppercase bg-purple-500/10 w-fit px-3 py-1.5 rounded-lg border border-purple-500/20">{shiftName}</div>
                          <div className="max-h-48 overflow-y-auto grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 custom-scrollbar pr-1 sm:pr-2">
                            {avail.map(seat => {
                              const isSelected = chosenAllocations[sId] === seat.id;
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => setChosenAllocations({ ...chosenAllocations, [sId]: seat.id })}
                                  className={`p-3 rounded-xl border text-center active:scale-95 transition-all duration-200 flex flex-col items-center justify-center min-h-[70px] ${
                                    isSelected ? 'bg-purple-600 border-purple-500 text-white shadow-[0_4px_15px_rgba(168,85,247,0.3)]' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="font-bold text-base sm:text-lg font-mono">#{seat.seatNumber}</div>
                                  <span className='text-[9px] sm:text-[10px] mt-1 opacity-70 truncate w-full px-1'>{seat?.roomName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Final Confirmation Box */}
                {Object.keys(chosenAllocations).length === selectedShiftIds.length && (
                  <div className="space-y-4 pt-4 bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-800/80 mt-6 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <label className="text-[10px] sm:text-[11px] font-bold text-purple-400 uppercase mb-2 block tracking-wider">Reason for Allocation (Required for Audit)</label>
                      <input
                        type="text"
                        placeholder={hasBookings ? "e.g. Changed seat because AC was too cold..." : "Initial seat assignment"}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-4 py-3.5 sm:py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
                      />
                    </div>
                    <button
                      onClick={handleSubmitReassignment}
                      disabled={submitting || !remarks}
                      className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-600 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] tracking-widest border border-purple-500/50"
                    >
                      {submitting ? <LuRefreshCw className="animate-spin w-5 h-5" /> : <LuUserCog className="w-5 h-5" />} Confirm Action
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}