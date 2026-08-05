import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuUserPlus,
  LuRefreshCw,
  LuClock,
  LuCheck,
  LuZap,
  LuSnowflake,
  LuX,
  LuPhone,
  LuLayoutDashboard,
} from 'react-icons/lu';
import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface ShiftBookingDetail {
  id: number;
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  studentId: number;
  studentName: string;
  studentPhone: string;
  fathersName: string;
  startDate: string;
  endDate: string;
  membershipId: number;
}

interface SeatStatus {
  id: number;
  seatNumber: number;
  nearAc?: boolean;
  chargingPoint?: boolean;
  genderType?: string;
  isBlocked: boolean;
  liveStatus: 'vacant' | 'partial' | 'fully_booked' | 'future_booked' | 'blocked';
  activeTodayCount: number;
  futureCount: number;
  totalShifts: number;
  bookings: ShiftBookingDetail[];
}

interface RoomStatus {
  id: number;
  name: string;
  seats: SeatStatus[];
}

function formatReadableDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export default function LibraryPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSeat, setSelectedSeat] = useState<SeatStatus | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    if (type === 'success') toast.success(content, { autoClose: 3500 });
    else toast.error(content, { autoClose: 3500 });
  };

  const fetchDashboardStatus = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/dashboard/${id}/seats-status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 403) {
        showToast('Access Denied', 'You are not authorized for this branch.', 'error');
        navigate('/me');
        return;
      }
      if (res.status === 401) {
        showToast('Session Expired', 'Please sign in again.', 'error');
        navigate('/signin');
        return;
      }

      if (!res.ok) throw new Error(data?.message || 'Failed to load live status');

      setRooms(data.rooms || []);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStatus();
  }, [id]);

  const totalSeats = rooms.reduce((sum, r) => sum + r.seats.length, 0);
  const fullyBookedCount = rooms.reduce(
    (sum, r) => sum + r.seats.filter((s) => s.liveStatus === 'fully_booked').length,
    0
  );
  const partialCount = rooms.reduce(
    (sum, r) => sum + r.seats.filter((s) => s.liveStatus === 'partial').length,
    0
  );
  const vacantCount = rooms.reduce(
    (sum, r) => sum + r.seats.filter((s) => s.liveStatus === 'vacant').length,
    0
  );

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-blue-600 selection:text-white flex flex-col md:flex-row font-mono">
      {/* GLOBAL STYLES FOR SCROLLBAR HIDING */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* REUSABLE SIDEBAR */}
      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName={`Branch #${id}`}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 relative z-10">
        
        {/* STICKY TOP HEADER / NAVIGATION BAR */}
        <div className="sticky top-2 sm:top-4 z-40 bg-[#080C14]/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <LuLayoutDashboard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] sm:text-[10px] text-blue-400 uppercase tracking-wider font-bold">Live Control Panel</span>
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">Floor Matrix</h1>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchDashboardStatus}
              className="flex-1 sm:flex-none py-2.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LuRefreshCw className={`w-4 h-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Status</span>
              <span className="sm:hidden">Sync</span>
            </button>
            <button
              onClick={() => navigate(`/library/${id}/admission`)}
              className="flex-[2] sm:flex-none py-2.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <LuUserPlus className="w-4 h-4 shrink-0" />
              <span>New Admission</span>
            </button>
          </div>
        </div>

        {/* METRICS GRID (2x2 on Mobile, 4-col on Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900/40 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Total Capacity</span>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">{totalSeats} <span className="text-[10px] sm:text-sm font-normal text-slate-500">Seats</span></div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 sm:p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-emerald-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Fully Vacant</span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-0.5">{vacantCount}</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 sm:p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-amber-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Partial Free</span>
            <div className="text-lg sm:text-xl font-extrabold text-amber-400 mt-0.5">{partialCount}</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 sm:p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-rose-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Fully Occupied</span>
            <div className="text-lg sm:text-xl font-extrabold text-rose-400 mt-0.5">{fullyBookedCount}</div>
          </div>
        </div>

        {/* FILTER BAR (Scrollable Row) */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: 'all', label: 'All Seats' },
            { id: 'vacant', label: '🟢 Fully Vacant' },
            { id: 'partial', label: '🟡 Partial Free' },
            { id: 'fully_booked', label: '🔴 Fully Occupied' },
            { id: 'future_booked', label: '🔵 Future Booked' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase transition-all shrink-0 whitespace-nowrap border ${
                filterStatus === f.id
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ROOMS & SEATS GRID */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <LuRefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <span className="text-xs sm:text-sm font-bold tracking-wider">Syncing Floor Layout...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {rooms.map((room) => {
              const filteredSeats = room.seats.filter((seat) => {
                if (filterStatus === 'all') return true;
                return seat.liveStatus === filterStatus;
              });

              if (filteredSeats.length === 0 && filterStatus !== 'all') return null;

              return (
                <div key={room.id} className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">{room.name}</h2>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                      {filteredSeats.length} Seats
                    </span>
                  </div>

                  {/* MOBILE: 3-col | TABLET: 4-col | DESKTOP: 6-col to 8-col */}
                  <div className="grid grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                    {filteredSeats.map((seat) => {
                      let borderStyle = 'border-slate-800 bg-[#080C14] hover:border-slate-600';
                      let statusBadgeName = 'VACANT';
                      let statusBadgeColor = 'text-emerald-400';
                      let dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';

                      if (seat.isBlocked) {
                        borderStyle = 'border-slate-800 bg-slate-950 opacity-40';
                        statusBadgeName = 'BLOCKED';
                        statusBadgeColor = 'text-slate-500';
                        dotColor = 'bg-slate-500';
                      } else if (seat.liveStatus === 'fully_booked') {
                        borderStyle = 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60';
                        statusBadgeName = 'OCCUPIED';
                        statusBadgeColor = 'text-rose-400';
                        dotColor = 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
                      } else if (seat.liveStatus === 'partial') {
                        borderStyle = 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60';
                        statusBadgeName = 'PARTIAL';
                        statusBadgeColor = 'text-amber-400';
                        dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
                      } else if (seat.liveStatus === 'future_booked') {
                        borderStyle = 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60';
                        statusBadgeName = 'FUTURE';
                        statusBadgeColor = 'text-blue-400';
                        dotColor = 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]';
                      }

                      return (
                        <div
                          key={seat.id}
                          onClick={() => setSelectedSeat(seat)}
                          className={`cursor-pointer border p-2 sm:p-3 rounded-xl flex flex-col justify-between h-[72px] sm:h-[84px] transition-all hover:scale-[1.02] ${borderStyle}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-mono font-extrabold text-sm sm:text-base text-white leading-none">
                              {seat.seatNumber}
                            </span>
                            <div className="flex flex-col items-end gap-1">
                              {/* Glowing Status Dot */}
                              <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400">
                              {seat.nearAc && <LuSnowflake className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />}
                              {seat.chargingPoint && <LuZap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />}
                              <span className="uppercase text-[7px] sm:text-[8px] font-bold tracking-tight truncate">
                                {seat.genderType === 'male' && '👨 Boys'}
                                {seat.genderType === 'female' && '👩 Girls'}
                                {(!seat.genderType || seat.genderType === 'all') && '👫 Uni'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-[7px] sm:text-[8px] font-extrabold uppercase tracking-widest ${statusBadgeColor}`}>
                                {statusBadgeName}
                              </span>
                              <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 font-bold bg-slate-900/80 px-1 rounded">
                                {seat.activeTodayCount}/{seat.totalShifts}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM SHEET MODAL (Mobile) / CENTERED MODAL (Desktop) */}
        {selectedSeat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
            {/* Modal Container */}
            <div className="bg-[#080C14] border border-slate-800 w-full max-w-lg max-h-[90vh] rounded-t-[32px] sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
              
              {/* Swipe Handle (Mobile only visual cue) */}
              <div className="w-full flex justify-center pt-3 sm:hidden pb-1">
                <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-5 sm:px-6 pb-4 pt-2 sm:pt-6 shrink-0">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    Seat #{selectedSeat.seatNumber} Details
                  </h2>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    Live Shift Assignments & Future Bookings
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="p-2 sm:p-2.5 rounded-full sm:rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <LuX className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6 custom-scrollbar">
                
                {/* SEAT ATTRIBUTES SUMMARY */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                  <span className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                    {selectedSeat.genderType === 'male' && '👨 Boys Only'}
                    {selectedSeat.genderType === 'female' && '👩 Girls Only'}
                    {(!selectedSeat.genderType || selectedSeat.genderType === 'all') && '👫 Unisex Allocation'}
                  </span>
                  {selectedSeat.nearAc && (
                    <span className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center gap-1.5">
                      <LuSnowflake className="w-3.5 h-3.5" /> Near AC
                    </span>
                  )}
                  {selectedSeat.chargingPoint && (
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
                      <LuZap className="w-3.5 h-3.5" /> Power Socket
                    </span>
                  )}
                </div>

                {/* BOOKINGS LIST */}
                <div className="space-y-3 pb-6">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block tracking-wider">
                    Enrolled Students ({selectedSeat.bookings.length}):
                  </span>

                  {selectedSeat.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSeat.bookings.map((b) => (
                        <div key={b.id} className="bg-slate-900/40 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                          
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                            <span className="font-extrabold text-[11px] sm:text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                              <LuClock className="w-3.5 h-3.5" /> {b.shiftName} <span className="text-slate-400 hidden xs:inline">({b.startTime} – {b.endTime})</span>
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                              M#{b.membershipId}
                            </span>
                          </div>
                          
                          {/* Mobile: shows times below shift name since hidden above */}
                          <div className="xs:hidden text-[10px] text-slate-400 font-bold -mt-2">
                            {b.startTime} – {b.endTime}
                          </div>

                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] sm:text-xs">
                            <div>
                              <span className="text-slate-500 block uppercase text-[8px] sm:text-[9px] font-bold tracking-wider mb-0.5">Student Name</span>
                              <span className="text-white font-bold">{b.studentName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[8px] sm:text-[9px] font-bold tracking-wider mb-0.5">Father's Name</span>
                              <span className="text-slate-300 truncate block">{b.fathersName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[8px] sm:text-[9px] font-bold tracking-wider mb-0.5">Phone</span>
                              <span className="text-slate-300 font-mono flex items-center gap-1">
                                <LuPhone className="w-3 h-3 text-blue-400" /> {b.studentPhone}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[8px] sm:text-[9px] font-bold tracking-wider mb-0.5">Validity</span>
                              <span className="text-emerald-400 font-bold block">
                                {formatReadableDate(b.startDate)} - {formatReadableDate(b.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                        <LuCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-emerald-400 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider">
                        Seat #{selectedSeat.seatNumber} is Fully Free!
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 max-w-[250px] mx-auto">
                        No active or future bookings exist for this seat across any shift.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer / Action Button */}
              <div className="border-t border-slate-800 p-4 sm:p-5 shrink-0 bg-[#080C14] rounded-b-3xl">
                <button
                  onClick={() => navigate(`/library/${id}/admission`)}
                  className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                >
                  Assign Seat to Student
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}