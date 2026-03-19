// src/screens/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  const [user, setUser] = useState(null);

  // Fetch the logged-in user from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fallbacks just in case the user hasn't set up a display name or photo yet
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Challenger';
  const photoURL = user?.photoURL || '/default-avatar.png';

  return (
    // Quoridor Theme: Deep brown/charcoal background instead of standard dark mode
    <div className="flex h-screen bg-[#241c15] text-[#f0d9b5] font-sans overflow-hidden">
      
      {/* --- MINIMAL SIDEBAR --- */}
      <aside className="w-20 lg:w-24 bg-[#1a140f] hidden md:flex flex-col items-center py-6 border-r border-[#3d2b1f] z-10 shadow-2xl">
        <div className="mb-10 w-full flex justify-center">
          <Link to="/home" className="hover:scale-110 transition-transform">
            <img src="/quoridor-logo.png" alt="Logo" className="w-12 h-12 rounded shadow-md" onError={(e) => e.target.style.display = 'none'} />
          </Link>
        </div>
        
        <nav className="flex flex-col gap-6 w-full px-2">
          <Link to="/board" className="group flex flex-col items-center gap-1 text-[#a08b74] hover:text-[#d4700a] transition-colors">
            <div className="bg-[#2a2118] p-3 rounded-xl group-hover:bg-[#3d2b1f] transition-colors">♟️</div>
            <span className="text-xs font-bold">Play</span>
          </Link>
          <Link to="/profile" className="group flex flex-col items-center gap-1 text-[#a08b74] hover:text-[#d4700a] transition-colors">
            <div className="bg-[#2a2118] p-3 rounded-xl group-hover:bg-[#3d2b1f] transition-colors">👤</div>
            <span className="text-xs font-bold">Profile</span>
          </Link>
          <button className="group flex flex-col items-center gap-1 text-[#a08b74] hover:text-[#d4700a] transition-colors mt-auto">
            <div className="bg-[#2a2118] p-3 rounded-xl group-hover:bg-[#3d2b1f] transition-colors">⚙️</div>
            <span className="text-xs font-bold">Settings</span>
          </button>
        </nav>
      </aside>

      {/* --- MAIN LOBBY AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        
        {/* Subtle background grid pattern to mimic the board */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col gap-8 relative z-10">
          
          {/* TOP BAR: Greeting & Dynamic User Profile */}
          <header className="flex justify-between items-center bg-[#1a140f]/80 backdrop-blur-md p-4 rounded-2xl border border-[#3d2b1f]">
            <div>
              <p className="text-[#a08b74] text-sm font-semibold tracking-wide uppercase">Welcome back to the maze</p>
              <h1 className="text-2xl font-extrabold">{displayName}</h1>
            </div>

            <Link to="/profile" className="flex items-center gap-4 hover:bg-[#2a2118] p-2 pr-4 rounded-xl transition-all border border-transparent hover:border-[#3d2b1f]">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm">Rating: 1200</p>
                <p className="text-xs text-[#d4700a] font-semibold">View Profile ›</p>
              </div>
              <div className="w-12 h-12 bg-[#3d2b1f] rounded-lg border-2 border-[#d4700a] overflow-hidden shadow-[0_0_10px_rgba(212,112,10,0.2)]">
                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </Link>
          </header>

          {/* HERO SECTION: Quick Play */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Play Card (Takes up 2/3 space) */}
            <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-[#d4700a] to-[#a35505] rounded-3xl p-1 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                <span className="text-[15rem]">♟️</span>
              </div>
              <div className="bg-[#241c15]/90 backdrop-blur-sm w-full h-full rounded-[1.4rem] p-8 flex flex-col justify-between relative z-10">
                <div>
                  <h2 className="text-4xl font-extrabold mb-2 text-white">Ranked Match</h2>
                  <p className="text-[#f0d9b5]/70 text-lg mb-8 max-w-sm">Find an opponent, place your walls wisely, and race to the other side.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <Link to="/board" className="bg-[#d4700a] hover:bg-[#f08a1c] text-white px-8 py-4 rounded-xl font-bold text-xl shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
                    ▶ Play Now
                  </Link>
                  <span className="text-[#a08b74] font-semibold text-sm">~ 15s wait time</span>
                </div>
              </div>
            </div>

            {/* Side Card: Bot Training */}
            <div className="col-span-1 bg-[#1a140f] border border-[#3d2b1f] rounded-3xl p-6 flex flex-col shadow-xl hover:border-[#a08b74] transition-colors">
              <div className="bg-[#2a2118] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border border-[#3d2b1f]">🤖</div>
              <h3 className="text-xl font-bold mb-2">Bot Training</h3>
              <p className="text-[#a08b74] text-sm mb-6 flex-1">Practice your pathfinding against our advanced Quoridor AI.</p>
              <Link to="/board" className="w-full bg-[#2a2118] hover:bg-[#3d2b1f] border border-[#3d2b1f] text-center py-3 rounded-xl font-bold transition-colors">
                Challenge Bot
              </Link>
            </div>
          </div>

          {/* BOTTOM ROW: Secondary Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Custom Game */}
            <div className="bg-[#1a140f] border border-[#3d2b1f] p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#201812] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#2a2118] rounded-full flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🤝</div>
                <div>
                  <h3 className="text-lg font-bold">Play with a Friend</h3>
                  <p className="text-[#a08b74] text-sm">Create a private room link</p>
                </div>
              </div>
              <div className="text-[#d4700a] text-2xl">›</div>
            </div>

            {/* Daily Puzzle/Maze */}
            <div className="bg-[#1a140f] border border-[#3d2b1f] p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#201812] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#2a2118] rounded-full flex items-center justify-center text-2xl group-hover:-rotate-12 transition-transform">🧩</div>
                <div>
                  <h3 className="text-lg font-bold">Daily Maze</h3>
                  <p className="text-[#a08b74] text-sm">Find the winning path in 3 moves</p>
                </div>
              </div>
              <div className="text-[#d4700a] text-2xl">›</div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}