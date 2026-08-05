import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuLayoutDashboard,
  LuUserPlus,
  LuRotateCcw,
  LuSettings,
  LuWallet,
  LuChevronLeft,
  LuChevronRight,
  LuArrowLeft,
  LuBuilding2,
  LuMenu,
  LuX,
  LuClock,
  LuActivity,
  LuCalendarSync,
  LuLogOut,
} from 'react-icons/lu';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://www.libdesk.online';

interface LibrarySidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  branchName?: string;
}

export default function LibrarySidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  branchName = 'Branch',
}: LibrarySidebarProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smart Scroll States for Twitter-like Mobile Navbar
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down and passed the very top, show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Exact matching for dashboard, partial matching for sub-pages
  const isActive = (path: string): boolean => {
    if (path === `/library/${id}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Dashboard', path: `/library/${id}`, icon: LuLayoutDashboard },
    { label: 'Admissions', path: `/library/${id}/admission`, icon: LuUserPlus },
    { label: 'Renewals', path: `/library/${id}/renewals`, icon: LuRotateCcw },
    { label: 'Payments', path: `/library/${id}/payment`, icon: LuWallet },
    { label: 'Expiring', path: `/library/${id}/expiring`, icon: LuClock },
    { label: 'Activity Log', path: `/library/${id}/activity`, icon: LuActivity },
    { label: 'Settings', path: `/library/${id}/settings`, icon: LuSettings },
    { label: 'Seat Management', path: `/library/${id}/seatmanagement`, icon: LuCalendarSync  },
  ];

  // Mobile Bottom Nav only shows the first 3 primary items + Menu
  const mobilePrimaryItems = navItems.slice(0, 3);

  // --- BULLETPROOF LOGOUT HANDLER ---
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
        toast.success("Logged out successfully");
        // Using window.location.href does a hard reload, which safely clears all React memory/state
        window.location.href = '/signin';
      } else {
        console.error('Failed to log out. Status:', response.status);
        toast.error('Failed to log out securely.');
      }
    } catch (err) {
      console.error('Network error during logout:', err);
      toast.error('Network error. Could not reach the server.');
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL STYLES (Invisible Scrollbars)                          */}
      {/* ------------------------------------------------------------- */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP & TABLET SIDEBAR (VISIBLE ON SCREEN WIDTH >= 768px)  */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen z-40 bg-[#080C14]/80 backdrop-blur-2xl border-r border-slate-800/80 transition-all duration-300 font-mono shadow-2xl ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* BRANCH HEADER */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
              <LuBuilding2 className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-sm text-white truncate">{branchName}</span>
                <span className="text-[9px] text-blue-400 font-mono tracking-widest">BRANCH #{id}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            {sidebarCollapsed ? <LuChevronRight className="w-4 h-4" /> : <LuChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAVIGATION LINKS (Added hide-scrollbar) */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all relative font-bold group ${
                  active
                    ? 'bg-gradient-to-r from-blue-600/15 to-transparent border border-blue-500/30 text-blue-400 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}

                <Icon className={`w-5 h-5 shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />

                {!sidebarCollapsed && (
                  <span className="uppercase tracking-wider text-[11px] truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM ACTIONS: TENANT HUB & LOGOUT */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => navigate('/me')}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all group ${
              sidebarCollapsed ? 'px-0' : 'px-4'
            }`}
            title={sidebarCollapsed ? "Tenant Hub" : undefined}
          >
            <LuArrowLeft className="w-4 h-4 text-blue-400 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!sidebarCollapsed && <span className="uppercase tracking-wider text-xs font-bold">Tenant Hub</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all group ${
              sidebarCollapsed ? 'px-0' : 'px-4'
            }`}
            title={sidebarCollapsed ? "Logout" : undefined}
          >
            <LuLogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="uppercase tracking-wider text-xs font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. DOCKED SMART MOBILE BOTTOM NAV (VISIBLE < 768px)           */}
      {/* ------------------------------------------------------------- */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 w-full z-40 transition-transform duration-300 ease-in-out ${
          isNavVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <nav className="bg-[#080C14]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around font-mono shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
          {mobilePrimaryItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all ${
                  active ? 'text-blue-400 bg-blue-600/15 shadow-inner' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-all ${active ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-110' : ''}`} />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-4 rounded-2xl text-slate-400 hover:text-white"
          >
            <LuMenu className="w-5 h-5 mb-1 text-slate-300" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider">Menu</span>
          </button>
        </nav>
        {/* iOS Safe Area Padder (Keeps bottom nav items above the iPhone home bar) */}
        <div className="bg-[#080C14]/95 pb-safe" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MOBILE SLIDE-OVER DRAWER (FULL MENU)                       */}
      {/* ------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          {/* Drawer Panel */}
          <div className="w-3/4 max-w-sm bg-[#080C14]/95 backdrop-blur-2xl border-l border-slate-800 h-full p-6 flex flex-col justify-between font-mono animate-in slide-in-from-right duration-300 shadow-2xl shadow-black">
            
            <div className="space-y-8 overflow-hidden flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <LuBuilding2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white truncate max-w-[120px]">{branchName}</div>
                    <div className="text-[10px] text-blue-400 tracking-widest">BRANCH #{id}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              {/* Full Navigation List (Added hide-scrollbar here) */}
              <div className="space-y-1.5 overflow-y-auto flex-1 hide-scrollbar pb-4">
                <span className="text-[10px] uppercase text-slate-500 font-extrabold tracking-widest block mb-3 px-2">
                  Library Engine
                </span>
                
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        active
                          ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border border-blue-500/30 shadow-inner'
                          : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* BOTTOM ACTIONS: Tenant Hub & Logout */}
              <div className="pt-4 border-t border-slate-800/50 shrink-0 space-y-3">
                <button
                  onClick={() => {
                    navigate('/me');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-extrabold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <LuArrowLeft className="w-4 h-4 text-blue-400" />
                  <span>Tenant Hub</span>
                </button>

                <button
                  onClick={(e) => {
                    setMobileMenuOpen(false); // Close menu first
                    handleLogout(e);          // Then trigger logout
                  }}
                  className="w-full py-3.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-[11px] font-extrabold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <LuLogOut className="w-4 h-4" />
                  <span>Logout Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}