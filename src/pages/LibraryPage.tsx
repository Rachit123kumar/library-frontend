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
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-blue-600 selection:text-white flex font-mono">
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL STYLES (Hide Scrollbars for Swipeable Areas)            */}
      {/* ------------------------------------------------------------- */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* REUSABLE SIDEBAR */}
      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName={`Branch #${id}`}
      />

      {/* MAIN CONTENT AREA - Added pb-32 for generous bottom scroll margin */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32 relative z-10">
        
        {/* STICKY TOP HEADER / NAVIGATION BAR */}
        <div className="sticky top-4 z-40 bg-[#080C14]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <LuLayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Live Control Panel</span>
              <h1 className="text-lg font-extrabold text-white leading-tight">Floor Matrix</h1>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchDashboardStatus}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LuRefreshCw className={`w-4 h-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Status</span>
              <span className="sm:hidden">Sync</span>
            </button>
            <button
              onClick={() => navigate(`/library/${id}/admission`)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <LuUserPlus className="w-4 h-4" />
              <span>New Admission</span>
            </button>
          </div>
        </div>

        {/* COMPACT & SCROLLABLE METRICS CARDS */}
        <div className="flex overflow-x-auto gap-3 mb-6 pb-2 custom-scrollbar snap-x">
          <div className="min-w-[140px] flex-1 bg-slate-900/40 border border-slate-800 p-3 rounded-xl shrink-0 snap-start">
            <span className="text-slate-400 text-[10px] uppercase block font-bold tracking-wider">Total Capacity</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{totalSeats} <span className="text-sm font-normal text-slate-500">Seats</span></span>
          </div>
          <div className="min-w-[140px] flex-1 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl shrink-0 snap-start">
            <span className="text-emerald-400 text-[10px] uppercase block font-bold tracking-wider">Fully Vacant</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{vacantCount}</span>
          </div>
          <div className="min-w-[140px] flex-1 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl shrink-0 snap-start">
            <span className="text-amber-400 text-[10px] uppercase block font-bold tracking-wider">Partial Free</span>
            <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{partialCount}</span>
          </div>
          <div className="min-w-[140px] flex-1 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl shrink-0 snap-start">
            <span className="text-rose-400 text-[10px] uppercase block font-bold tracking-wider">Fully Occupied</span>
            <span className="text-xl font-extrabold text-rose-400 mt-0.5 block">{fullyBookedCount}</span>
          </div>
        </div>

        {/* FILTER BAR (Also Compact) */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar snap-x">
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
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all shrink-0 snap-start border ${
                filterStatus === f.id
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ROOMS & SEATS GRID */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <LuRefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <span className="text-sm">Calculating real-time floor status...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room) => {
              const filteredSeats = room.seats.filter((seat) => {
                if (filterStatus === 'all') return true;
                return seat.liveStatus === filterStatus;
              });

              if (filteredSeats.length === 0 && filterStatus !== 'all') return null;

              return (
                <div key={room.id} className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">{room.name}</h2>
                    <span className="text-[11px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                      {filteredSeats.length} Seats
                    </span>
                  </div>

                  {/* SMALLER SEAT CARDS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                    {filteredSeats.map((seat) => {
                      let borderStyle = 'border-slate-800 bg-[#080C14] hover:border-slate-600';
                      let statusBadge = 'VACANT';
                      let statusBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                      if (seat.isBlocked) {
                        borderStyle = 'border-slate-800 bg-slate-950 opacity-50';
                        statusBadge = 'BLOCKED';
                        statusBadgeColor = 'text-slate-500 bg-slate-800 border-slate-700';
                      } else if (seat.liveStatus === 'fully_booked') {
                        borderStyle = 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60';
                        statusBadge = 'OCCUPIED';
                        statusBadgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
                      } else if (seat.liveStatus === 'partial') {
                        borderStyle = 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60';
                        statusBadge = 'PARTIAL';
                        statusBadgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                      } else if (seat.liveStatus === 'future_booked') {
                        borderStyle = 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60';
                        statusBadge = 'FUTURE';
                        statusBadgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                      }

                      return (
                        <div
                          key={seat.id}
                          onClick={() => setSelectedSeat(seat)}
                          className={`cursor-pointer border p-2.5 rounded-xl space-y-1.5 transition-all hover:-translate-y-0.5 ${borderStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm text-white">
                              #{seat.seatNumber}
                            </span>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-[4px] border uppercase tracking-wider ${statusBadgeColor}`}>
                              {statusBadge}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                            {seat.nearAc && <LuSnowflake className="w-3 h-3 text-cyan-400" />}
                            {seat.chargingPoint && <LuZap className="w-3 h-3 text-emerald-400" />}
                            <span className="uppercase text-[8px] font-bold tracking-tight">
                              {seat.genderType === 'male' && '👨 Boys'}
                              {seat.genderType === 'female' && '👩 Girls'}
                              {(!seat.genderType || seat.genderType === 'all') && '👫 Unisex'}
                            </span>
                          </div>

                          <div className="text-[9px] text-slate-500 font-bold border-t border-slate-800 pt-1 mt-1">
                            {seat.activeTodayCount}/{seat.totalShifts} Active
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

        {/* SEAT DETAILS DRAWER / MODAL */}
        {selectedSeat && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end p-4">
            <div className="bg-[#080C14] border border-slate-800 w-full max-w-lg h-full max-h-[90vh] rounded-3xl p-5 sm:p-6 overflow-y-auto space-y-5 relative shadow-2xl custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    Seat #{selectedSeat.seatNumber} Allocation
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                    Live Shift Assignments & Future Bookings
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              {/* SEAT ATTRIBUTES SUMMARY */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  {selectedSeat.genderType === 'male' && '👨 Boys Only'}
                  {selectedSeat.genderType === 'female' && '👩 Girls Only'}
                  {(!selectedSeat.genderType || selectedSeat.genderType === 'all') && '👫 Unisex'}
                </span>
                {selectedSeat.nearAc && (
                  <span className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center gap-1.5">
                    <LuSnowflake className="w-3.5 h-3.5" /> Near AC
                  </span>
                )}
                {selectedSeat.chargingPoint && (
                  <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
                    <LuZap className="w-3.5 h-3.5" /> Power Socket
                  </span>
                )}
              </div>

              {/* BOOKINGS LIST */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 block tracking-wider">
                  Enrolled Students ({selectedSeat.bookings.length}):
                </span>

                {selectedSeat.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSeat.bookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="font-extrabold text-[11px] sm:text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <LuClock className="w-3.5 h-3.5" /> {b.shiftName} ({b.startTime} – {b.endTime})
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            M#{b.membershipId}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px] sm:text-xs">
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider mb-0.5">Student Name</span>
                            <span className="text-white font-bold">{b.studentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider mb-0.5">Father's Name</span>
                            <span className="text-slate-300">{b.fathersName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider mb-0.5">Phone</span>
                            <span className="text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                              <LuPhone className="w-3 h-3 text-blue-400" /> {b.studentPhone}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wider mb-0.5">Validity</span>
                            <span className="text-emerald-400 font-bold text-[10px] sm:text-[11px] block mt-0.5">
                              {formatReadableDate(b.startDate)} - {formatReadableDate(b.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl text-center space-y-2">
                    <LuCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                    <div className="text-emerald-400 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider">
                      Seat #{selectedSeat.seatNumber} is Fully Free!
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400">
                      No active or future bookings exist for this seat across any shift.
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK ACTION BUTTON */}
              <button
                onClick={() => navigate(`/library/${id}/admission`)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all mt-4"
              >
                Assign Seat to Student
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}