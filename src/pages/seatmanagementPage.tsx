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
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans flex font-mono selection:bg-purple-600">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-purple-600/15 via-fuchsia-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <LibrarySidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 relative z-10 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex justify-between items-center">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 uppercase font-bold tracking-wider">Operational Adjustments</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Seat Management</h1>
          </div>
          <button onClick={() => navigate(`/library/${id}`)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl border border-slate-700 flex items-center gap-2 transition-all">
            <LuArrowLeft className="w-4 h-4 text-purple-400" /> Back
          </button>
        </div>

        {!selectedStudent ? (
          <div className="space-y-6">
            
            {/* FLOATING MEMBERS QUEUE */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-bold flex items-center gap-2"><LuUsers className="text-purple-400" /> Floating Members Queue</h2>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Requires Seat Assignment</span>
              </div>
              
              <div className="overflow-x-auto min-h-[150px]">
                {loadingFloating ? (
                  <div className="flex justify-center items-center h-32"><LuRefreshCw className="w-6 h-6 text-purple-400 animate-spin" /></div>
                ) : floatingMembers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No floating members. Everyone has a seat!</div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#080C14]/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Student Info</th>
                        <th className="px-6 py-4">Membership Cycle</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {floatingMembers.map(std => (
                        <tr key={std.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm">{std.name} <span className="ml-1 text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">ID #{std.memberships[0].id}</span></div>
                            <div className="text-[10px] text-slate-500 mt-1">Father: {std.fathersName} • Phone: {std.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-[10px]">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <LuCalendar className="w-3.5 h-3.5 text-purple-400" />
                              {new Date(std.memberships[0].startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})} - 
                              <span className="text-emerald-400 font-bold ml-1">{new Date(std.memberships[0].endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedStudent(std)} className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/30 uppercase tracking-wider transition-all">
                              Assign Seat
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {floatingPagination.totalPages > 1 && (
                <div className="p-3 border-t border-slate-800 flex justify-between items-center bg-slate-900/30">
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => fetchFloatingMembers(floatingPagination.currentPage - 1)} disabled={floatingPagination.currentPage === 1} className="p-1.5 bg-slate-800 rounded"><LuChevronLeft /></button>
                    <span className="text-xs font-bold px-2">{floatingPagination.currentPage} / {floatingPagination.totalPages}</span>
                    <button onClick={() => fetchFloatingMembers(floatingPagination.currentPage + 1)} disabled={floatingPagination.currentPage === floatingPagination.totalPages} className="p-1.5 bg-slate-800 rounded"><LuChevronRight /></button>
                  </div>
                </div>
              )}
            </div>

            {/* GENERAL SEARCH FOR REASSIGNMENT */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6">
              <h2 className="text-base font-bold flex items-center gap-2"><LuSearch className="text-purple-400"/> Reassign Existing Seat</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search by Name, Phone, or ID to change a seat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none"
                />
                <button onClick={handleSearch} disabled={searching} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-2 transition-all border border-slate-700">
                  {searching ? <LuRefreshCw className="animate-spin" /> : <LuSearch />} Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3 pt-4">
                  {searchResults.map((std) => (
                    <div key={std.id} onClick={() => setSelectedStudent(std)} className="bg-[#080C14] border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all">
                      <div>
                        <div className="font-bold">{std.name} <span className="text-purple-400 text-[10px] ml-2 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Mem #{std.memberships[0].id}</span></div>
                        <div className="text-xs text-slate-400 mt-1">{std.phone}</div>
                      </div>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] uppercase font-bold rounded-lg transition-all">Select</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {selectedStudent.name} 
                  {!hasBookings && <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">Floating Member</span>}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Membership #{selectedStudent.memberships[0].id} (Ends {new Date(selectedStudent.memberships[0].endDate).toLocaleDateString()})</p>
              </div>
              <button onClick={() => { setSelectedStudent(null); setSelectedShiftIds([]); setAvailableSeatsArraysEmpty(); }} className="text-xs text-purple-400 underline font-bold uppercase tracking-wider">Cancel</button>
            </div>

            {/* MULTI-SHIFT SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  {hasBookings ? "Select shifts to change seats for:" : "Select shifts to assign to this member:"}
                </label>
                {hasBookings && selectedStudent.memberships[0].bookings.length > 1 && (
                  <button 
                    onClick={() => setSelectedShiftIds(selectedStudent.memberships[0].bookings.map((b: any) => b.shiftId))} 
                    className="text-[10px] uppercase text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded"
                  >
                    Select All Booked Shifts
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hasBookings ? (
                  // Changing Seat -> Show their booked shifts
                  selectedStudent.memberships[0].bookings.map((b: any) => {
                    const isSelected = selectedShiftIds.includes(b.shiftId);
                    return (
                      <button
                        key={b.shiftId}
                        onClick={() => toggleShift(b.shiftId)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10' : 'bg-[#080C14] border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-bold">{b.shift.name}</div>
                          {isSelected && <LuCheck className="text-purple-400 w-4 h-4" />}
                        </div>
                        <div className="text-[10px] mt-1 text-slate-500">Current: <span className="text-amber-400 font-bold">Seat #{b.seat?.seatNumber}</span>
                      
                        
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
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10' : 'bg-[#080C14] border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-sm">{shift.name}</div>
                          {isSelected && <LuCheck className="text-purple-400 w-4 h-4" />}
                        </div>
                        <div className="text-[10px] mt-1 text-slate-500">{shift.startTime} - {shift.endTime}</div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {selectedShiftIds.length > 0 && (
              <button onClick={handleCheckSeats} disabled={checkingSeats} className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all">
                {checkingSeats ? <LuRefreshCw className="animate-spin text-purple-400" /> : <LuGrid2X2 className="text-purple-400" />} Find Available Seats for Selected Shifts
              </button>
            )}

            {/* SEAT AVAILABILITY MATRIX */}
            {isAvailableChecked && (
              <div className="space-y-6 pt-6 border-t border-slate-800 animate-in fade-in">
                
                {hasContinuousSeat ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
                      <LuCheckCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-emerald-400 font-bold text-xs uppercase">Continuous Single Seat Available!</div>
                        <div className="text-xs text-slate-300 mt-0.5">Select one seat below for all {selectedShiftIds.length} shift(s):</div>
                      </div>
                    </div>

                    <div className="bg-[#080C14] border border-slate-800 p-5 rounded-2xl">
                      <div className="max-h-64 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 gap-3 custom-scrollbar pr-2">
                        {continuousSeats.map(seat => {
                          // Check if this seat is chosen for ALL selected shifts
                          const isSelected = selectedShiftIds.every(sId => chosenAllocations[sId] === seat.id);
                          return (
                            <button
                              key={seat.id}
                              onClick={() => {
                                const newAlloc: Record<number, number> = {};
                                selectedShiftIds.forEach(sId => newAlloc[sId] = seat.id);
                                setChosenAllocations(newAlloc);
                              }}
                              className={`p-4 rounded-2xl border text-center transition-all ${
                                isSelected ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/40 scale-105' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              <div className="font-bold text-lg font-mono">#{seat.seatNumber}</div>
                              <div className="text-[9px] uppercase tracking-wider mt-1 truncate opacity-70">{seat.roomName}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                      <LuGrid2X2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-amber-400 font-bold text-xs uppercase">Split Seats Required</div>
                        <div className="text-xs text-slate-300 mt-0.5">No single continuous seat is free. Please select a separate seat for each shift:</div>
                      </div>
                    </div>

                    {selectedShiftIds.map(sId => {
                      const shiftName = library?.shifts?.find((s:any) => s.id === sId)?.name || 'Shift';
                      const avail = availabilityPerShift[sId] || [];
                      return (
                        <div key={sId} className="bg-[#080C14] border border-slate-800 p-5 rounded-2xl space-y-3">
                          <div className="text-xs font-bold text-purple-400 uppercase">{shiftName}</div>
                          <div className="max-h-48 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 gap-3 custom-scrollbar pr-2">
                            {avail.map(seat => {
                              const isSelected = chosenAllocations[sId] === seat.id;
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => setChosenAllocations({ ...chosenAllocations, [sId]: seat.id })}
                                  className={`p-3 rounded-xl border text-center transition-all ${
                                    isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                                  }`}
                                >
                                  <div className="font-bold text-base font-mono">#{seat.seatNumber}
                                    
                                  </div>
                                  <span className='text-xs'>{seat?.roomName}</span>
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
                  <div className="space-y-4 pt-4 bg-[#080C14] p-5 rounded-2xl border border-slate-800 mt-6 shadow-xl">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Reason for Allocation (Required for Audit)</label>
                      <input
                        type="text"
                        placeholder={hasBookings ? "e.g. Changed seat because AC was too cold..." : "Initial seat assignment"}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      onClick={handleSubmitReassignment}
                      disabled={submitting || !remarks}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 tracking-widest"
                    >
                      {submitting ? <LuRefreshCw className="animate-spin" /> : <LuUserCog />} Confirm Action
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