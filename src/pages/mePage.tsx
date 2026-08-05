import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import {
  LuBookOpen,
  LuPlus,
  LuBuilding2,
  LuMapPin,
  LuSettings,
  LuCircle,
  LuCrown,
  LuUser,
  LuLogOut,
  LuClock,
  LuUsers,
  LuDoorClosed,
  LuLayers,
  LuArrowRight,
  LuX,
  LuRefreshCw,
  LuShieldCheck,
  LuChevronLeft,
  LuChevronRight,
  LuLayoutDashboard,
  LuMenu,
} from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL! || 'http://127.0.0.1:3000';

const librarySchema = z.object({
  name: z.string().trim().min(3, { message: 'Library name must be at least 3 characters.' }),
  address: z.string().trim().min(5, { message: 'Address must be at least 5 characters.' }),
  holdDays: z.number().min(1).max(30),
});

type LibraryFormInputs = z.infer<typeof librarySchema>;

interface LibraryItem {
  id: number;
  name: string;
  address: string;
  holdDays: number;
  createdAt: string;
  _count?: {
    rooms: number;
    students: number;
    shifts: number;
  };
}

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  libraries: LibraryItem[];
  ownedLibraries?: LibraryItem[];
}

export default function MePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // Sidebar States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LibraryFormInputs>({
    resolver: zodResolver(librarySchema),
    defaultValues: {
      name: '',
      address: '',
      holdDays: 3,
    },
  });

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    const opts = { toastId: 'me-page-toast', autoClose: 4000 };
    if (type === 'success') toast.success(content, opts);
    else toast.error(content, opts);
  };

  // Fetch /api/v1/users/me sending HTTP-Only Cookie
  const fetchUserData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.status === 401) {
        showToast('Session Expired', data?.message || 'Please log in again.', 'error');
        navigate('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch user profile.');
      }

      const rawUser = data?.user || {};
      const normalizedLibraries = rawUser.libraries || rawUser.ownedLibraries || [];

      setProfile({
        ...rawUser,
        libraries: normalizedLibraries,
      });
    } catch (err: any) {
      showToast('Error Loading Profile', err?.message || 'An error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onSubmitLibrary: SubmitHandler<LibraryFormInputs> = async (formData) => {
    setCreating(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/libraries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 401) {
        showToast('Unauthorized', 'Your session expired. Please log in.', 'error');
        navigate('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create library.');
      }

      showToast('Library Created!', `${formData.name} is initialized.`, 'success');
      setIsModalOpen(false);
      reset();
      fetchUserData();
    } catch (err: any) {
      showToast('Creation Failed', err?.message || 'Could not create library.', 'error');
    } finally {
      setCreating(false);
    }
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    console.log("Initiating logout request to:", `${BASE_URL}/api/v1/auth/logout`);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      console.log("Logout response status:", response.status);

      if (response.ok) {
        showToast("Success", "Logged out successfully", "success");
        window.location.href = '/signin';
      } else {
        console.error('Failed to log out. Status:', response.status);
        showToast("Logout Failed", 'Failed to log out securely.', 'error');
      }
    } catch (err) {
      console.error('Network error during logout:', err);
      showToast("Network Error", 'Could not reach the server.', 'error');
    }
  };

  const librariesList = profile?.libraries || [];

  const navItems = [
    { label: 'Overview', icon: LuLayoutDashboard, href: '/me', active: true },
    { label: 'Membership', icon: LuCrown, href: '/membership' },
    { label: 'Settings', icon: LuSettings, href: '/settings' },
    { label: 'Support', icon: LuCircle, href: '/support' },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-blue-600 selection:text-white flex flex-col md:flex-row">
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden sticky top-0 z-40 bg-[#080C14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
            <LuBookOpen className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-base">Libdesk Cloud</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800"
        >
          {mobileMenuOpen ? <LuX className="w-5 h-5" /> : <LuMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen z-40 bg-[#080C14]/90 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* SIDEBAR BRAND HEADER */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80">
          <a href="/me" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 shrink-0">
              <LuBookOpen className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Libdesk <span className="text-blue-400 font-semibold font-mono text-xs">Cloud</span>
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Tenant Hub</span>
              </div>
            )}
          </a>

          {/* TOGGLE BUTTON */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors hidden md:block"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <LuChevronRight className="w-4 h-4" /> : <LuChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 py-6 px-3 space-y-2 font-mono text-xs">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                item.active
                  ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="uppercase tracking-wider whitespace-nowrap">{item.label}</span>}
            </a>
          ))}
        </div>

        {/* USER INFO & LOGOUT FOOTER */}
        <div className="p-3 border-t border-slate-800/80 font-mono text-xs space-y-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <LuUser className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-slate-300 font-bold truncate">{profile?.fullName || 'Admin'}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-all ${
              sidebarCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Log Out"
          >
            <LuLogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="uppercase tracking-wider">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER NAV */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-6 font-mono text-xs space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <span className="font-bold text-white uppercase tracking-wider">Navigation Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
              <LuX className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2 flex-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 uppercase tracking-wider"
              >
                <item.icon className="w-5 h-5 text-blue-400" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
          <button
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleLogout(e);
            }}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase tracking-wider rounded-xl"
          >
            <LuLogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* HEADER SPOTLIGHT */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 mb-3">
                <LuShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tenant Owner Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                Welcome back, <span className="text-blue-400">{profile?.fullName || 'Admin'}</span>
              </h1>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Manage your study center instances, create new branches, and oversee room shift allocations.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 border border-blue-400/30 self-start md:self-auto shrink-0"
            >
              <LuPlus className="w-4 h-4" />
              <span>Create New Library</span>
            </button>
          </div>

          {/* LIBRARIES LIST */}
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-slate-400">
              <span className="uppercase tracking-wider">Your Registered Libraries ({librariesList.length})</span>
            </div>

            {loading ? (
              <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
                <LuRefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <span>Validating session & loading libraries...</span>
              </div>
            ) : librariesList.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center font-mono space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
                  <LuBuilding2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Libraries Found</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You haven't initialized any library workspace yet. Click the button below to register your first branch.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-blue-600/30 inline-flex items-center gap-2"
                >
                  <LuPlus className="w-4 h-4" />
                  <span>Create Library Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {librariesList.map((lib) => (
                  <div
                    key={lib.id}
                    className="bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between gap-6 group hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <LuBuilding2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                          ID: #{lib.id}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {lib.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mt-1">
                          <LuMapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{lib.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 font-mono text-xs">
                      <div className="text-center p-2 rounded-lg bg-[#080C14]">
                        <div className="text-slate-500 text-[10px] uppercase flex items-center justify-center gap-1">
                          <LuDoorClosed className="w-3 h-3" /> Rooms
                        </div>
                        <div className="text-white font-bold mt-0.5">{lib._count?.rooms || 0}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-[#080C14]">
                        <div className="text-slate-500 text-[10px] uppercase flex items-center justify-center gap-1">
                          <LuUsers className="w-3 h-3" /> Students
                        </div>
                        <div className="text-white font-bold mt-0.5">{lib._count?.students || 0}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-[#080C14]">
                        <div className="text-slate-500 text-[10px] uppercase flex items-center justify-center gap-1">
                          <LuLayers className="w-3 h-3" /> Shifts
                        </div>
                        <div className="text-white font-bold mt-0.5">{lib._count?.shifts || 0}</div>
                      </div>
                    </div>

                    <a
                      href={`/library/${lib.id}`}
                      className="w-full py-2.5 bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700/80"
                    >
                      <span>Open Workspace</span>
                      <LuArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-800/80 bg-[#050810] py-8 text-slate-500 text-xs font-mono relative z-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>© {new Date().getFullYear()} Libdesk Cloud. Operations in Bihar, India.</div>
            <div className="flex space-x-4">
              <a href="/" className="hover:text-slate-300">Home</a>
              <span>•</span>
              <a href="/privacy" className="hover:text-slate-300">Privacy Policy</a>
              <span>•</span>
              <a href="/contact" className="hover:text-slate-300">Support</a>
            </div>
          </div>
        </footer>
      </div>

      {/* CREATE LIBRARY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full font-mono relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LuBuilding2 className="w-5 h-5 text-blue-400" />
                Initialize New Library
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitLibrary)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label className="block text-xs uppercase text-slate-300">
                  Library Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Reading Room"
                  {...register('name')}
                  className={`w-full bg-[#080C14] border ${
                    errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                  } rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors`}
                />
                {errors.name && <p className="text-[10px] text-rose-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase text-slate-300">
                  Full Physical Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Boring Road, Patna, Bihar"
                  {...register('address')}
                  className={`w-full bg-[#080C14] border ${
                    errors.address ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                  } rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors`}
                />
                {errors.address && <p className="text-[10px] text-rose-400">{errors.address.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase text-slate-300">
                  Default Seat Hold Days
                </label>
                <div className="relative">
                  <LuClock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    max={30}
                    {...register('holdDays', { valueAsNumber: true })}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {creating ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : 'Create Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}