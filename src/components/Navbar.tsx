import { useState } from "react";
import { LuBookOpen, LuMenu, LuX } from "react-icons/lu";
import { Link } from "react-router-dom";
const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Admission', path: '/admission' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expire', path: '/expire' },
    { label: 'Renew', path: '/renew' },
    { label: 'Setting', path: '/setting' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C14]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 text-left group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <LuBookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              ARA <span className="text-blue-400 font-semibold">Library</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">SaaS Cloud Platform</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="py-2 px-3 rounded-xl transition-all hover:text-white hover:bg-slate-800/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center space-x-3">
          <Link 
            to="/dashboard" 
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white px-3.5 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/admission" 
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 border border-blue-400/30"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0E1A] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/80">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-2">
            <Link 
              to="/admission"
              onClick={() => setMobileMenuOpen(false)} 
              className="block w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;