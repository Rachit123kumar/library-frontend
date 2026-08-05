import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  LuBuilding2,
  LuMapPin,
  LuMail,
  LuClock,
  LuPlus,
  LuPencil ,
  LuSave,
  // LuX,
  LuZap,
  LuSlidersHorizontal ,
  LuArmchair,
  LuShieldCheck,
  LuGrid2X2,
  LuLoader,
  LuRefreshCw,
  LuLayers,
  LuSparkles,
  LuLock,
  LuLockKeyholeOpen 
} from 'react-icons/lu';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export interface Room {
  id: number;
  name: string;
  description: string | null;
  _count?: { seats: number };
}

export interface Seat {
  id: number;
  seatNumber: number;
  nearAc: boolean;
  chargingPoint: boolean;
  isBlocked: boolean;
  room?: { name: string };
}

// const BASE_URL ='https://api.libdesk.online';
const BASE_URL = import.meta.env?.VITE_API_URL || 'https://api.libdesk.online';

export default function SettingsPage(): React.JSX.Element {
  // Global Profile Details State
  const [libraryName, setLibraryName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [holdDays, setHoldDays] = useState('3');
  const [createdAtDate, setCreatedAtDate] = useState('');

  // Rooms Architecture Infrastructure Management States
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomDesc, setEditRoomDesc] = useState('');

  // Dynamic Sequential Seat Generator Parameters
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startSeatNum, setStartSeatNum] = useState('1');
  const [endSeatNum, setEndSeatNum] = useState('50');

  // Interactive Live Filtering Desk Grid States
  const [filterRoomId, setFilterRoomId] = useState('');
  const [allSeats, setAllSeats] = useState<Seat[]>([]);

  // Independent Skeleton Loading States
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);

  const showToast = (title: string, msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{msg}</div>
      </div>
    );
    const opts = { toastId: 'settings-single-toast', autoClose: 3000 };
    if (type === 'success') toast.success(content, opts);
    else if (type === 'error') toast.error(content, opts);
    else toast.info(content, opts);
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  useEffect(() => {
    loadSeatsList();
  }, [filterRoomId]);

  const loadSettingsData = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/global`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        if (data.settings) {
          setLibraryName(data.settings.libraryName || '');
          setAddress(data.settings.address || '');
          setEmail(data.settings.email || 'admin@libdesk.online');
          setHoldDays(data.settings.holdDays?.toString() || '3');
          if (data.settings.createdAt) {
            setCreatedAtDate(new Date(data.settings.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            }));
          }
        }
        if (data.rooms) {
          setRoomsList(data.rooms);
          if (!selectedRoomId && data.rooms.length > 0) {
            setSelectedRoomId(data.rooms[0].id.toString());
          }
        }
      }
    } catch (err) {
      console.error("Error fetching library settings configuration payload:", err);
      showToast("Data Sync Error", "Unable to load settings from server.", "error");
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadSeatsList = async () => {
    setLoadingSeats(true);
    try {
      const url = filterRoomId 
        ? `${BASE_URL}/api/v1/seats-list?roomId=${filterRoomId}`
        : `${BASE_URL}/api/v1/seats-list`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.seats)) {
        setAllSeats(data.seats);
      } else {
        setAllSeats([]);
      }
    } catch (err) {
      console.error("Error retrieving desk arrays:", err);
      setAllSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleGlobalConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGlobal(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/global`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryName, address, holdDays })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Config Updated", data.message || "Profile directories successfully customized.", "success");
        loadSettingsData();
      } else {
        showToast("Update Failed", data.message || "Could not save configuration", "error");
      }
    } catch (err) {
      console.error("Error saving global config:", err);
      showToast("Network Error", "Failed to save configuration to server.", "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName, description: newRoomDesc })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Room Added", data.message || `Created ${newRoomName}`, "success");
        setNewRoomName('');
        setNewRoomDesc('');
        loadSettingsData();
      } else {
        showToast("Action Failed", data.message || "Could not add room block", "error");
      }
    } catch (err) {
      console.error("Error creating room:", err);
      showToast("Server Error", "Failed to communicate with room API.", "error");
    }
  };

  const handleUpdateRoomExecute = async (roomId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editRoomName, description: editRoomDesc })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Room Updated", data.message || "Room parameters updated", "success");
        setEditingRoomId(null);
        loadSettingsData();
      } else {
        showToast("Update Failed", data.message || "Could not update room", "error");
      }
    } catch (err) {
      console.error("Error updating room:", err);
      showToast("Server Error", "Failed to update room details.", "error");
    }
  };

  const handleBatchSeatCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      showToast("Room Required", "Please specify an active room to populate.", "error");
      return;
    }
    setSavingBatch(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/seats/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          startNumber: startSeatNum,
          endNumber: endSeatNum
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Matrix Populated", data.message || "Batch matrix population successfully processed.", "success");
        loadSeatsList();
        loadSettingsData();
      } else {
        showToast("Batch Failed", data.message || "Failed to generate seat range.", "error");
      }
    } catch (err) {
      console.error("Error generating seats:", err);
      showToast("Server Error", "Batch seat generation failed.", "error");
    } finally {
      setSavingBatch(false);
    }
  };

  const toggleSeatFeature = async (seat: Seat, updatedFields: Partial<Seat>) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/seats/${seat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setAllSeats(prev => prev.map(s => s.id === seat.id ? { ...s, ...updatedFields } : s));
        showToast("Seat Updated", `Desk #${seat.seatNumber} configuration saved`, "success");
      } else {
        showToast("Update Failed", data.message || "Could not toggle desk feature", "error");
      }
    } catch (err) {
      console.error("Error toggling seat feature:", err);
      showToast("Server Error", "Failed to update desk settings.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative pb-20 overflow-x-hidden">
      <Navbar/>
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Main Page Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10">
        
        {/* Sub-Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 mb-2">
              <LuSlidersHorizontal  className="w-3.5 h-3.5" />
              <span>Master System Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Infrastructure & Rules Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Configure library profile attributes, physical room boundaries, and desk matrix properties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadSettingsData();
                loadSeatsList();
              }}
              disabled={loadingSettings || loadingSeats}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reload Infrastructure Settings"
            >
              <LuRefreshCw className={`w-4 h-4 ${(loadingSettings || loadingSeats) ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {createdAtDate && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-xl shrink-0">
                <LuShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Tenant Initialized</span>
                  <strong className="text-slate-200">{createdAtDate}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: GLOBAL IDENTITY & ROOM MANAGEMENT */}
          <div className="lg:col-span-6 space-y-6">
            
            {}
            {/* 1. CORE IDENTITY FORM */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs">1</span>
                  Library Core Identity & Rules
                </h2>
                <LuBuilding2 className="w-4 h-4 text-blue-400" />
              </div>

              {loadingSettings ? (
                /* Skeleton Loader for Form */
                <div className="space-y-4 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-800/80 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-40 bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-800/60 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-36 bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-800/80 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-48 bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-800/80 rounded-xl" />
                  </div>
                  <div className="h-11 w-full bg-slate-800 rounded-xl mt-4" />
                </div>
              ) : (
                <form onSubmit={handleGlobalConfigSubmit} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 uppercase">Library Display Title *</label>
                    <input
                      required
                      type="text"
                      value={libraryName}
                      onChange={(e) => setLibraryName(e.target.value)}
                      placeholder="e.g. ARA Study Hall & Reading Room"
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-400 uppercase">
                      Admin Contact Email <span className="text-slate-500">(Immutable)</span>
                    </label>
                    <div className="relative">
                      <LuMail className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        disabled
                        type="email"
                        value={email}
                        className="w-full bg-slate-950 border border-slate-800/60 rounded-xl pl-9 pr-4 py-2.5 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 uppercase">Physical Address *</label>
                    <div className="relative">
                      <LuMapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        required
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, Landmark, City, State"
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 uppercase">Seat Hold Grace Window (Days) *</label>
                    <div className="relative">
                      <LuClock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        type="number"
                        min="0"
                        value={holdDays}
                        onChange={(e) => setHoldDays(e.target.value)}
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 pt-0.5">Days to hold desk allocations after expiration before releasing to open pool.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={savingGlobal}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center justify-center gap-2 mt-2"
                  >
                    {savingGlobal ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />}
                    <span>Save Global Configuration</span>
                  </button>
                </form>
              )}
            </div>

            {}
            {/* 2. ROOM SECTORS MANAGEMENT */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs">2</span>
                  Room Sectors & Capacity
                </h2>
                <LuLayers className="w-4 h-4 text-indigo-400" />
              </div>

              {/* Room Cards List */}
              <div className="space-y-3">
                {loadingSettings ? (
                  /* Skeleton Loader for Room Sector Cards */
                  <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080C14] border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-36 bg-slate-800 rounded" />
                          <div className="h-4 w-16 bg-slate-800 rounded-full" />
                        </div>
                        <div className="h-3 w-56 bg-slate-800/60 rounded" />
                      </div>
                    ))}
                  </div>
                ) : roomsList.length === 0 ? (
                  <div className="p-6 text-center bg-[#080C14] rounded-xl border border-slate-800/80 text-slate-500 text-xs font-mono space-y-2">
                    <LuLayers className="w-6 h-6 mx-auto text-slate-600" />
                    <p>No active room sectors found. Add your first room block below.</p>
                  </div>
                ) : (
                  roomsList.map((room) => (
                    <div key={room.id} className="p-4 rounded-xl bg-[#080C14] border border-slate-800/90 space-y-2 font-mono text-xs">
                      {editingRoomId === room.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editRoomName}
                            onChange={(e) => setEditRoomName(e.target.value)}
                            placeholder="Room Name"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            value={editRoomDesc}
                            onChange={(e) => setEditRoomDesc(e.target.value)}
                            placeholder="Description"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateRoomExecute(room.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRoomId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">{room.name}</span>
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold">
                                {room._count?.seats || 0} Desks
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                              {room.description || 'Standard Study Space Sector'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoomId(room.id);
                              setEditRoomName(room.name);
                              setEditRoomDesc(room.description || '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Edit Room"
                          >
                            <LuPencil  className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Append Room Form */}
              <form onSubmit={handleCreateRoom} className="pt-2 border-t border-slate-800 space-y-3 font-mono text-xs">
                <span className="text-indigo-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <LuPlus className="w-3.5 h-3.5" /> Add New Room Block
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Room Name (e.g. Ground AC)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Features / Notes"
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 border border-emerald-400/30 flex items-center justify-center gap-1.5"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  <span>Create Room Sector</span>
                </button>
              </form>
            </div>

            {}
            {/* 3. BATCH SEAT GENERATOR */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs">3</span>
                  Batch Seat Generator
                </h2>
                <LuSparkles className="w-4 h-4 text-cyan-400" />
              </div>

              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                Populate room space grids instantly using custom numerical limits (e.g. Seat #1 to #50).
              </p>

              {loadingSettings ? (
                /* Skeleton Loader for Batch Generator */
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 w-full bg-slate-800 rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-slate-800 rounded-xl" />
                    <div className="h-10 bg-slate-800 rounded-xl" />
                  </div>
                  <div className="h-11 w-full bg-slate-800 rounded-xl" />
                </div>
              ) : roomsList.length === 0 ? (
                <div className="p-4 bg-[#080C14] rounded-xl border border-slate-800 text-slate-500 text-xs font-mono text-center">
                  Create a room block above first to enable batch seat generation.
                </div>
              ) : (
                <form onSubmit={handleBatchSeatCreation} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 uppercase">Target Room Zone *</label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      {roomsList.map(r => (
                        <option key={r.id} value={r.id.toString()}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 uppercase">Start Seat # *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={startSeatNum}
                        onChange={(e) => setStartSeatNum(e.target.value)}
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 uppercase">End Seat # *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={endSeatNum}
                        onChange={(e) => setEndSeatNum(e.target.value)}
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingBatch}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/20 border border-cyan-400/30 flex items-center justify-center gap-2"
                  >
                    {savingBatch ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuGrid2X2 className="w-4 h-4" />}
                    <span>Generate Seat Range</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {}
          {/* RIGHT COLUMN: INDIVIDUAL DESK FEATURE CONTROL MATRIX */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-5">
              
              {/* Matrix Control Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs">4</span>
                    Desk Feature Control Matrix
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Toggle AC features or lock desks for maintenance.
                  </p>
                </div>

                {/* Filter Dropdown */}
                <select
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                  className="bg-[#080C14] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All Rooms ({allSeats.length} Desks)</option>
                  {roomsList.map(r => (
                    <option key={r.id} value={r.id.toString()}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Seats Grid Matrix Display with Skeleton Loading */}
              {loadingSeats ? (
                /* Skeleton Loader for Seat Grid Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1 animate-pulse">
                  {[...Array(8)].map((_, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-800/80 bg-[#080C14] space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div className="h-3.5 w-20 bg-slate-800 rounded" />
                        <div className="h-2.5 w-16 bg-slate-800/60 rounded" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-7 flex-1 bg-slate-800 rounded-lg" />
                        <div className="h-7 flex-1 bg-slate-800 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allSeats.length === 0 ? (
                <div className="p-12 text-center bg-[#080C14] rounded-xl border border-slate-800 text-slate-500 text-xs font-mono space-y-2">
                  <LuArmchair className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No active desks found for this filter selection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
                  {allSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className={`p-3.5 rounded-xl border font-mono transition-all space-y-3 ${
                        seat.isBlocked
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                          : 'bg-[#080C14] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <LuArmchair className="w-3.5 h-3.5 text-blue-400" />
                          Desk #{seat.seatNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                          {seat.room?.name || 'Main Hall'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* AC Feature Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleSeatFeature(seat, { nearAc: !seat.nearAc })}
                          className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                            seat.nearAc
                              ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <LuZap className="w-3 h-3 text-cyan-400" />
                          <span>{seat.nearAc ? 'Near AC' : 'Non-AC'}</span>
                        </button>

                        {/* Block/Unblock Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleSeatFeature(seat, { isBlocked: !seat.isBlocked })}
                          className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                            seat.isBlocked
                              ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                              : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20'
                          }`}
                        >
                          {seat.isBlocked ? (
                            <><LuLock className="w-3 h-3 text-rose-400" /> Blocked</>
                          ) : (
                            <><LuLockKeyholeOpen  className="w-3 h-3 text-emerald-400" /> Active</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </main>
      <Footer/>
    </div>
  );
}