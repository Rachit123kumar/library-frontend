import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuGrid2X2,
  LuDoorClosed,
  LuPlus,
  LuX,
  LuRefreshCw,
  LuClock,
  LuTrash2,
  LuSave,
  LuShieldAlert,
  LuSnowflake,
  LuZap,
  LuPencil,
} from 'react-icons/lu';

// IMPORT REUSABLE SIDEBAR COMPONENT
import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface Seat {
  id: number;
  seatNumber: number;
  genderType: 'male' | 'female' | 'all';
  nearAc: boolean;
  chargingPoint: boolean;
  isBlocked: boolean;
}

interface Room {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  seats: Seat[];
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  price: number;
  description?: string;
}

interface LibraryData {
  id: number;
  name: string;
  address: string;
  holdDays: number;
  rooms: Room[];
  shifts: Shift[];
}

// Time Conversion Helpers
function parse24HTo12H(time24: string) {
  try {
    const [hStr, mStr] = (time24 || '06:00').split(':');
    let h = parseInt(hStr, 10) || 0;
    const minute = mStr || '00';
    let period = 'AM';

    if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    }
    if (h === 0) h = 12;

    const hour = h < 10 ? `0${h}` : `${h}`;
    return { hour, minute, period };
  } catch {
    return { hour: '06', minute: '00', period: 'AM' };
  }
}

function format12HTo24H(hour: string, minute: string, period: string) {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  const hStr = h < 10 ? `0${h}` : `${h}`;
  return `${hStr}:${minute}`;
}

export default function SettingLibraryPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Profile Form States
  const [libName, setLibName] = useState('');
  const [libAddress, setLibAddress] = useState('');
  const [libHoldDays, setLibHoldDays] = useState(3);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Submitting States
  const [savingRoom, setSavingRoom] = useState<boolean>(false);
  const [generatingSeats, setGeneratingSeats] = useState<boolean>(false);
  const [savingShift, setSavingShift] = useState<boolean>(false);

  // Modal States
  const [roomModal, setRoomModal] = useState<boolean>(false);
  const [editRoomModal, setEditRoomModal] = useState<boolean>(false);
  const [seatModal, setSeatModal] = useState<boolean>(false);
  const [shiftModal, setShiftModal] = useState<boolean>(false);

  // Editing Selection States
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Room Forms
  const [roomName, setRoomName] = useState('');
  const [roomIsActive, setRoomIsActive] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Seat Batch Form
  const [fromSeat, setFromSeat] = useState(1);
  const [toSeat, setToSeat] = useState(20);
  const [genderType, setGenderType] = useState<'male' | 'female' | 'all'>('all');

  // Shift Form
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('12:00');
  const [shiftPrice, setShiftPrice] = useState(500);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    if (type === 'success') toast.success(content, { autoClose: 3000 });
    else toast.error(content, { autoClose: 3000 });
  };

  const fetchSettings = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/settings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 401) {
        showToast('Not Logged In', 'Redirecting to login...', 'error');
        navigate('/signin');
        return;
      }
      if (res.status === 403) {
        showToast('Access Denied', 'You are not owner or staff of this branch.', 'error');
        navigate('/me');
        return;
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch settings');

      setLibrary(data.library);
      setLibName(data.library.name || '');
      setLibAddress(data.library.address || '');
      setLibHoldDays(data.library.holdDays ?? 3);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [id]);

  // =========================================
  // PROFILE MANAGEMENT
  // =========================================
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: libName, address: libAddress, holdDays: Number(libHoldDays) }),
      });
      const data = await res.json();
      if (res.status === 403) { navigate('/me'); return; }
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Library profile updated!', 'success');
      fetchSettings();
    } catch (err: any) {
      showToast('Update Error', err.message, 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // =========================================
  // ROOM MANAGEMENT
  // =========================================
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    try {
      setSavingRoom(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: roomName }),
      });
      const data = await res.json();
      if (res.status === 403) { navigate('/me'); return; }
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Room created!', 'success');
      setRoomModal(false);
      setRoomName('');
      fetchSettings();
    } catch (err: any) {
      showToast('Creation Error', err.message, 'error');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !roomName.trim()) return;
    try {
      setSavingRoom(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/rooms/${editingRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: roomName, isActive: roomIsActive }),
      });
      const data = await res.json();
      if (res.status === 403) { navigate('/me'); return; }
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Room updated successfully!', 'success');
      setEditRoomModal(false);
      setEditingRoom(null);
      fetchSettings();
    } catch (err: any) {
      showToast('Update Error', err.message, 'error');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('WARNING: Are you sure you want to delete this room? This requires all seats to be empty.')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.status === 403) { navigate('/me'); return; }
      if (!res.ok) throw new Error(data.message); // Will throw safe delete error if occupied
      showToast('Success', 'Room deleted safely', 'success');
      setEditRoomModal(false);
      setEditingRoom(null);
      fetchSettings();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomIsActive(room.isActive ?? true);
    setEditRoomModal(true);
  };

  // =========================================
  // SEAT MANAGEMENT
  // =========================================
  const handleGenerateSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;
    try {
      setGeneratingSeats(true);
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/rooms/${selectedRoomId}/seats/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fromSeat, toSeat, genderType }),
      });
      const data = await res.json();
      if (res.status === 403) { navigate('/me'); return; }
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Seats generated!', 'success');
      setSeatModal(false);
      fetchSettings();
    } catch (err: any) {
      showToast('Generation Error', err.message, 'error');
    } finally {
      setGeneratingSeats(false);
    }
  };

  const handleUpdateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeat) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/seats/${editingSeat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          seatNumber: editingSeat.seatNumber,
          genderType: editingSeat.genderType,
          nearAc: editingSeat.nearAc,
          chargingPoint: editingSeat.chargingPoint,
          isBlocked: editingSeat.isBlocked,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Seat updated successfully', 'success');
      setEditingSeat(null);
      fetchSettings();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteSeat = async (seatId: number) => {
    if (!window.confirm('Delete this seat? Cannot be undone if it has active bookings.')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/seats/${seatId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Seat deleted', 'success');
      setEditingSeat(null);
      fetchSettings();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // =========================================
  // SHIFT MANAGEMENT
  // =========================================
  const openCreateShiftModal = () => {
    setEditingShift(null);
    setShiftName('');
    setStartTime('06:00');
    setEndTime('12:00');
    setShiftPrice(500);
    setShiftModal(true);
  };

  const openEditShiftModal = (shift: Shift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setShiftPrice(shift.price);
    setShiftModal(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      showToast('Validation Error', 'Shift name is required.', 'error');
      return;
    }

    try {
      setSavingShift(true);
      const isEditing = !!editingShift;
      const url = isEditing
        ? `${BASE_URL}/api/v1/settingLibrary/${id}/shifts/${editingShift.id}`
        : `${BASE_URL}/api/v1/settingLibrary/${id}/shifts`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: shiftName, startTime, endTime, price: shiftPrice }),
      });
      const data = await res.json();

      if (res.status === 403) { navigate('/me'); return; }
      if (!res.ok) throw new Error(data.message);

      showToast('Success', isEditing ? 'Shift updated!' : 'Shift created!', 'success');
      setShiftModal(false);
      setEditingShift(null);
      fetchSettings();
    } catch (err: any) {
      showToast('Shift Error', err.message, 'error');
    } finally {
      setSavingShift(false);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    if (!window.confirm('Are you sure you want to delete this shift? This will fail if there are active bookings.')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/settingLibrary/${id}/shifts/${shiftId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Success', 'Shift deleted successfully', 'success');
      fetchSettings();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-blue-600 selection:text-white flex font-mono">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* REUSABLE SHARED SIDEBAR */}
      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName={library?.name || 'Settings'}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl mb-8 flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 uppercase">
              Branch Configuration
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Branch Settings & Matrix Engine</h1>
          </div>
          <button
            onClick={() => navigate(`/library/${id}`)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all"
          >
            View Live Branch
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <LuRefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <span>Loading branch structure...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* LIBRARY PROFILE & HOLD DAYS CARD */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white">General Branch Profile</h2>
                <p className="text-xs text-slate-400">Update library name, location address, and renewal hold days policy.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Library Name</label>
                    <input
                      type="text"
                      value={libName}
                      onChange={(e) => setLibName(e.target.value)}
                      required
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hold Days (Grace Period)</label>
                    <input
                      type="number"
                      min={0}
                      value={libHoldDays}
                      onChange={(e) => setLibHoldDays(Number(e.target.value))}
                      required
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Branch Address</label>
                  <input
                    type="text"
                    value={libAddress}
                    onChange={(e) => setLibAddress(e.target.value)}
                    required
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {updatingProfile ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />}
                  <span>{updatingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>

            {/* ROOMS & SEATS SECTION */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <LuDoorClosed className="w-5 h-5 text-blue-400" /> Rooms & Seat Matrix
                  </h2>
                  <p className="text-xs text-slate-400">Manage rooms or click any seat badge below to edit attributes.</p>
                </div>
                <button
                  onClick={() => { setRoomName(''); setRoomModal(true); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <LuPlus className="w-4 h-4" /> Add Room
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {library?.rooms.map((room) => (
                  <div key={room.id} className="bg-[#080C14] border border-slate-800 rounded-2xl p-5 space-y-4 relative">
                    {/* Room Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white text-base">
                          {room.name}
                        </h3>
                        {room.isActive === false && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[9px] uppercase font-bold">Disabled</span>
                        )}
                        <button
                          onClick={() => openEditRoomModal(room)}
                          className="text-slate-500 hover:text-blue-400 transition-colors"
                          title="Edit / Delete Room"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setSeatModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                      >
                        <LuGrid2X2 className="w-3.5 h-3.5" /> Generate Seats
                      </button>
                    </div>

                    <div className="text-xs text-slate-400">Total Seats: {room.seats.length}</div>

                    {/* INTERACTIVE SEAT GRID PREVIEW */}
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900/50 rounded-xl border border-slate-800/80 custom-scrollbar">
                      {room.seats.map((seat) => {
                        let badgeStyle = 'border-slate-700 bg-slate-800/60 text-slate-300';
                        if (seat.isBlocked) badgeStyle = 'border-rose-500/50 bg-rose-500/20 text-rose-400 line-through';
                        else if (seat.genderType === 'female') badgeStyle = 'border-pink-500/40 bg-pink-500/10 text-pink-400';
                        else if (seat.genderType === 'male') badgeStyle = 'border-blue-500/40 bg-blue-500/10 text-blue-400';

                        return (
                          <div
                            key={seat.id}
                            onClick={() => setEditingSeat(seat)}
                            className={`p-2 rounded-lg border text-center text-[10px] font-bold cursor-pointer hover:scale-105 transition-all ${badgeStyle}`}
                            title="Click to edit seat"
                          >
                            #{seat.seatNumber}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHIFTS CONFIGURATION SECTION */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <LuClock className="w-5 h-5 text-blue-400" /> Shift Timings & Pricing
                  </h2>
                  <p className="text-xs text-slate-400">Configure morning, evening, or full-day shifts.</p>
                </div>
                <button
                  onClick={openCreateShiftModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <LuPlus className="w-4 h-4" /> Create Shift
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                {library?.shifts.map((shift) => (
                  <div key={shift.id} className="bg-[#080C14] border border-slate-800 p-4 rounded-2xl space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white truncate max-w-[70%]">{shift.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditShiftModal(shift)}
                          className="text-slate-500 hover:text-blue-400 transition-colors"
                          title="Edit Shift"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Shift"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{shift.startTime} - {shift.endTime}</div>
                    <div className="text-xs font-bold text-emerald-400">₹{shift.price} / month</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODALS SECTION */}
      {/* ------------------------------------------------------------- */}

      {/* EDIT SEAT / BLOCK MODAL */}
      {editingSeat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center text-white font-bold text-sm uppercase">
              <span>Manage Seat #{editingSeat.seatNumber}</span>
              <button onClick={() => setEditingSeat(null)} className="text-slate-400 hover:text-white">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSeat} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Seat Number</label>
                <input
                  type="number"
                  value={editingSeat.seatNumber}
                  onChange={(e) => setEditingSeat({ ...editingSeat, seatNumber: Number(e.target.value) })}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gender Restriction</label>
                <select
                  value={editingSeat.genderType}
                  onChange={(e: any) => setEditingSeat({ ...editingSeat, genderType: e.target.value })}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="all">Unisex (All)</option>
                  <option value="male">Boys Only</option>
                  <option value="female">Girls Only</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-[#080C14] p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <LuSnowflake className="w-4 h-4 text-cyan-400" /> Near AC
                </span>
                <input
                  type="checkbox"
                  checked={editingSeat.nearAc}
                  onChange={(e) => setEditingSeat({ ...editingSeat, nearAc: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between bg-[#080C14] p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <LuZap className="w-4 h-4 text-emerald-400" /> Power Socket
                </span>
                <input
                  type="checkbox"
                  checked={editingSeat.chargingPoint}
                  onChange={(e) => setEditingSeat({ ...editingSeat, chargingPoint: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                <span className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                  <LuShieldAlert className="w-4 h-4" /> Block Seat (Maintenance)
                </span>
                <input
                  type="checkbox"
                  checked={editingSeat.isBlocked}
                  onChange={(e) => setEditingSeat({ ...editingSeat, isBlocked: e.target.checked })}
                  className="rounded bg-slate-900 border-rose-700 text-rose-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSeat(editingSeat.id)}
                  className="w-1/3 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold uppercase rounded-xl"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Update Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {roomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center text-white font-bold text-sm uppercase">
              <span>Create Room</span>
              <button onClick={() => setRoomModal(false)} className="text-slate-400 hover:text-white">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Hall A (AC)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                disabled={savingRoom}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={savingRoom}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingRoom ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{savingRoom ? 'Saving...' : 'Save Room'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / DELETE ROOM MODAL */}
      {editRoomModal && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center text-white font-bold text-sm uppercase">
              <span>Manage Room</span>
              <button onClick={() => setEditRoomModal(false)} className="text-slate-400 hover:text-white">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateRoom} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Room Name</label>
                <input
                  type="text"
                  placeholder="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  disabled={savingRoom}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between bg-[#080C14] p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-bold">Room is Active</span>
                <input
                  type="checkbox"
                  checked={roomIsActive}
                  onChange={(e) => setRoomIsActive(e.target.checked)}
                  disabled={savingRoom}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteRoom(editingRoom.id)}
                  disabled={savingRoom}
                  className="w-1/3 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold uppercase rounded-xl disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingRoom ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE SEATS MODAL */}
      {seatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center text-white font-bold text-sm uppercase">
              <span>Batch Generate Seats</span>
              <button onClick={() => setSeatModal(false)} className="text-slate-400 hover:text-white">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateSeats} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="From"
                  value={fromSeat}
                  onChange={(e) => setFromSeat(Number(e.target.value))}
                  required
                  disabled={generatingSeats}
                  className="w-1/2 bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="To"
                  value={toSeat}
                  onChange={(e) => setToSeat(Number(e.target.value))}
                  required
                  disabled={generatingSeats}
                  className="w-1/2 bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <select
                value={genderType}
                onChange={(e: any) => setGenderType(e.target.value)}
                disabled={generatingSeats}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="all">All Genders</option>
                <option value="male">Boys Only</option>
                <option value="female">Girls Only</option>
              </select>
              <button
                type="submit"
                disabled={generatingSeats}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generatingSeats ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{generatingSeats ? 'Generating...' : 'Generate Seats'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SHIFT MODAL */}
      {shiftModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center text-white font-bold text-sm uppercase">
              <span>{editingShift ? 'Edit Shift' : 'Create Shift'}</span>
              <button onClick={() => setShiftModal(false)} className="text-slate-400 hover:text-white">
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveShift} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Shift Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Shift"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  required
                  disabled={savingShift}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* TIME PICKERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">
                    Start Time
                  </label>
                  {(() => {
                    const parsed = parse24HTo12H(startTime);
                    return (
                      <div className="grid grid-cols-3 gap-1 bg-[#080C14] border border-slate-800 rounded-xl p-1.5">
                        <select
                          value={parsed.hour}
                          disabled={savingShift}
                          onChange={(e) => {
                            const new24 = format12HTo24H(e.target.value, parsed.minute, parsed.period);
                            setStartTime(new24);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg py-1 text-xs text-white text-center focus:outline-none"
                        >
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={parsed.minute}
                          disabled={savingShift}
                          onChange={(e) => {
                            const new24 = format12HTo24H(parsed.hour, e.target.value, parsed.period);
                            setStartTime(new24);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg py-1 text-xs text-white text-center focus:outline-none"
                        >
                          {['00', '15', '30', '45'].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={parsed.period}
                          disabled={savingShift}
                          onChange={(e) => {
                            const new24 = format12HTo24H(parsed.hour, parsed.minute, e.target.value);
                            setStartTime(new24);
                          }}
                          className="bg-blue-600/20 border border-blue-500/40 rounded-lg py-1 text-xs font-bold text-blue-400 text-center focus:outline-none"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">
                    End Time
                  </label>
                  {(() => {
                    const parsed = parse24HTo12H(endTime);
                    return (
                      <div className="grid grid-cols-3 gap-1 bg-[#080C14] border border-slate-800 rounded-xl p-1.5">
                        <select
                          value={parsed.hour}
                          disabled={savingShift}
                          onChange={(e) => {
                            const new24 = format12HTo24H(e.target.value, parsed.minute, parsed.period);
                            setEndTime(new24);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg py-1 text-xs text-white text-center focus:outline-none"
                        >
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={parsed.minute}
                          disabled={savingShift}
                          onChange={(e) => {
                            const new24 = format12HTo24H(parsed.hour, e.target.value, parsed.period);
                            setEndTime(new24);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg py-1 text-xs text-white text-center focus:outline-none"
                        >
                          {['00', '15', '30', '45'].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={parsed.period}
                          disabled={savingShift}
                          onChange={(e) => {
                            const new24 = format12HTo24H(parsed.hour, parsed.minute, e.target.value);
                            setEndTime(new24);
                          }}
                          className="bg-blue-600/20 border border-blue-500/40 rounded-lg py-1 text-xs font-bold text-blue-400 text-center focus:outline-none"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Monthly Fee (INR)
                </label>
                <input
                  type="number"
                  placeholder="Price (INR)"
                  value={shiftPrice}
                  onChange={(e) => setShiftPrice(Number(e.target.value))}
                  required
                  disabled={savingShift}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={savingShift}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingShift ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{savingShift ? 'Saving...' : editingShift ? 'Update Shift' : 'Save Shift'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}