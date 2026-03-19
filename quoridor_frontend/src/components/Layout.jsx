// src/components/Layout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex h-screen bg-[#241c15] text-[#f0d9b5] font-sans overflow-hidden">
      
      {/* --- GLOBAL SIDEBAR --- */}
      <aside className="w-16 lg:w-20 bg-[#1a140f] hidden md:flex flex-col items-center py-6 border-r border-[#3d2b1f] z-20 shadow-2xl shrink-0">
        
        {/* Logo */}
        <div className="mb-10 w-full flex justify-center">
          <Link to="/home" className="hover:scale-110 transition-transform">
            <img src="/quoridor-logo.png" alt="Logo" className="w-10 h-10 rounded shadow-md" onError={(e) => e.target.style.display = 'none'} />
          </Link>
        </div>
        
        <nav className="flex flex-col gap-6 w-full px-2 h-full">
          {/* Play Link */}
          <Link to="/board" className="group flex flex-col items-center gap-1 transition-colors">
            <div className={`p-3 rounded-xl border transition-colors ${path.includes('/board') ? 'bg-[#3d2b1f] border-[#d4700a] text-[#d4700a]' : 'bg-[#2a2118] border-transparent text-[#a08b74] group-hover:bg-[#3d2b1f] group-hover:text-[#d4700a]'}`}>
              ♟️
            </div>
          </Link>

          {/* Profile Link */}
          <Link to="/profile" className="group flex flex-col items-center gap-1 transition-colors">
            <div className={`p-3 rounded-xl border transition-colors ${path.includes('/profile') ? 'bg-[#3d2b1f] border-[#d4700a] text-[#d4700a]' : 'bg-[#2a2118] border-transparent text-[#a08b74] group-hover:bg-[#3d2b1f] group-hover:text-[#d4700a]'}`}>
              👤
            </div>
          </Link>

          {/* Settings Button (Pushed to bottom) */}
          <button className="group flex flex-col items-center gap-1 mt-auto transition-colors">
            <div className="bg-[#2a2118] p-3 rounded-xl border border-transparent text-[#a08b74] group-hover:bg-[#3d2b1f] group-hover:text-[#d4700a] transition-colors">
              ⚙️
            </div>
          </button>
        </nav>
      </aside>

      {/* --- DYNAMIC PAGE CONTENT GOES HERE --- */}
      {children}
      
    </div>
  );
}