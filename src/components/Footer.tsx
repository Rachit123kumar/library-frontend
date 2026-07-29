
import { LuBookOpen } from 'react-icons/lu'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div>
         <footer className="border-t border-slate-800/80 bg-[#050810] py-12 text-slate-400 text-xs mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <LuBookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">ARA Library Cloud</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">The modern cloud management platform for study halls & reading rooms across India.</p>
          </div>

          <div>
            <div className="font-mono text-white font-semibold uppercase mb-3">Pages</div>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/admission" className="hover:text-white">Admission</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-white font-semibold uppercase mb-3">App Pages</div>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link to="/expire" className="hover:text-white">Expirations</Link></li>
              <li><Link to="/renew" className="hover:text-white">Renewals</Link></li>
              <li><Link to="/setting" className="hover:text-white">Settings</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-white font-semibold uppercase mb-3">Legal</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} ARA Library Management. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
