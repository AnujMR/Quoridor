// src/screens/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '../store/useAuthStore';

// Dummy data for the game history
const GAME_HISTORY = [
  { id: 1, opponent: 'ZEUSRS45', opponentRating: 504, result: 'win', moves: 29, date: 'Dec 14, 2025', flag: '🇮🇳' },
  { id: 2, opponent: 'TacticalWall', opponentRating: 410, result: 'loss', moves: 42, date: 'Dec 12, 2025', flag: '🇺🇸' },
  { id: 3, opponent: 'PawnPusher99', opponentRating: 395, result: 'win', moves: 18, date: 'Dec 10, 2025', flag: '🇬🇧' },
  { id: 4, opponent: 'QuoridorKing', opponentRating: 450, result: 'draw', moves: 55, date: 'Dec 08, 2025', flag: '🇨🇦' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Overview');
  // const [user, setUser] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  // Fetch the logged-in user from Firebase
  // useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //   setUser(currentUser);
    // });
    // return () => unsubscribe();
  // }, []);

  // Firebase Fallbacks
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Challenger';
  const photoURL = currentUser?.profile || '/default-avatar.png';
  
  
  // Format Firebase account creation date, or fallback to a default
  const joinDate = currentUser?.created_at 
    ? currentUser?.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    // We removed the flex h-screen wrapper and the sidebar.
    // Layout.jsx handles that now! We just return the <main> block.
    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- 1. PROFILE HEADER --- */}
        <div className="bg-[#1a140f] rounded-t-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-[#3d2b1f]">
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#2a2118] rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[#d4700a] shadow-[0_0_15px_rgba(212,112,10,0.2)]">
            <img 
              src={photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none' }} 
            />
          </div>

          {/* User Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold mb-2 text-white">{displayName}</h1>
            <div className="text-sm text-[#a08b74] flex flex-wrap items-center gap-x-4 gap-y-2">
              <span><strong className="text-[#f0d9b5]">{joinDate}</strong> Joined</span>
              <span><strong className="text-[#f0d9b5]">1</strong> Friend</span>
              <span><strong className="text-[#f0d9b5]">1</strong> View</span>
              <span className="flex items-center gap-2 text-[#d4700a] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#d4700a] animate-pulse"></span>
                In the Maze
              </span>
            </div>
          </div>
        </div>

        {/* --- 2. TABS NAVIGATION --- */}
        <div className="bg-[#1a140f] rounded-b-2xl px-6 flex overflow-x-auto border-b-4 border-[#1a140f]">
          {['Overview', 'Games', 'Stats', 'Friends', 'Awards', 'Clubs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-[#d4700a] text-white' 
                  : 'border-transparent text-[#a08b74] hover:text-[#f0d9b5]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- 3. MAIN CONTENT GRID --- */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ranked Card */}
              <div className="bg-[#1a140f] p-5 rounded-2xl border border-[#3d2b1f] hover:border-[#a08b74] cursor-pointer transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#2a2118] p-3 rounded-xl border border-[#3d2b1f] group-hover:bg-[#3d2b1f] transition-colors text-xl">🏆</div>
                  <div>
                    <h3 className="text-[#a08b74] text-sm font-bold uppercase tracking-wider">Ranked Elo</h3>
                    <p className="text-3xl font-extrabold text-white">1200</p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#3d2b1f] mt-2 relative rounded-full overflow-hidden">
                   <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-[#d4700a] to-[#f08a1c] rounded-full"></div>
                </div>
              </div>

              {/* Puzzles Card */}
              <div className="bg-[#1a140f] p-5 rounded-2xl border border-[#3d2b1f] hover:border-[#a08b74] cursor-pointer transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#2a2118] p-3 rounded-xl border border-[#3d2b1f] group-hover:bg-[#3d2b1f] transition-colors text-xl">🧩</div>
                  <div>
                    <h3 className="text-[#a08b74] text-sm font-bold uppercase tracking-wider">Daily Maze</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-extrabold text-white">1307</p>
                      <span className="text-red-400 text-sm font-bold mb-1">↓ 8</span>
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#3d2b1f] mt-2 relative rounded-full overflow-hidden">
                   <div className="absolute top-0 left-0 h-full w-4/5 bg-gradient-to-r from-[#d4700a] to-[#f08a1c] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Active Match Prompt */}
            <div className="bg-[#1a140f] p-6 rounded-2xl border border-[#3d2b1f] flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold mb-1 text-white">Active Matches <span className="text-[#a08b74] font-normal">(0)</span></h2>
                <p className="text-[#a08b74] text-sm">You have no ongoing asynchronous games.</p>
              </div>
              <Link to="/board" className="bg-[#d4700a] hover:bg-[#f08a1c] text-white px-8 py-3 rounded-xl font-bold shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap">
                Find Match
              </Link>
            </div>

            {/* Game History Table */}
            <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden">
              <div className="p-5 border-b border-[#3d2b1f]">
                <h2 className="text-xl font-extrabold text-white">Game History <span className="text-[#a08b74] font-normal text-lg">(62)</span></h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[#a08b74] text-xs uppercase tracking-wider bg-[#201812] border-b border-[#3d2b1f]">
                      <th className="p-4 font-bold w-16 text-center">Mode</th>
                      <th className="p-4 font-bold">Players</th>
                      <th className="p-4 font-bold text-center">Result</th>
                      <th className="p-4 font-bold text-center">Moves</th>
                      <th className="p-4 font-bold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GAME_HISTORY.map((game, index) => (
                      <tr 
                        key={game.id} 
                        className={`border-b border-[#3d2b1f] hover:bg-[#2a2118] cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-[#1a140f]' : 'bg-[#201812]'}`}
                      >
                        <td className="p-4 text-center">
                          <span className="text-[#a08b74] text-xl">⏱️<br/><span className="text-[10px] font-bold">10 min</span></span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-[#f0d9b5] shadow-sm"></div> {/* White Pawn */}
                              <span className="font-bold text-white">{game.opponent}</span>
                              <span className="text-[#a08b74] text-sm">({game.opponentRating})</span>
                              <span>{game.flag}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-[#1c1714] border border-[#a08b74] shadow-sm"></div> {/* Black Pawn */}
                              <span className="font-bold text-white">{displayName}</span>
                              <span className="text-[#a08b74] text-sm">(1200)</span>
                              <span>🇮🇳</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center font-extrabold text-lg">
                            {game.result === 'win' && <span className="text-[#d4700a]">1</span>}
                            {game.result === 'loss' && <span className="text-[#a08b74] opacity-50">0</span>}
                            {game.result === 'draw' && <span className="text-[#f0d9b5]">½</span>}
                          </div>
                        </td>
                        <td className="p-4 text-center text-[#a08b74] font-bold">{game.moves}</td>
                        <td className="p-4 text-right text-[#a08b74] text-sm whitespace-nowrap">{game.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <div className="flex flex-col gap-6">

            {/* League Widget */}
            <div className="bg-[#1a140f] p-5 rounded-2xl border border-[#3d2b1f] hover:border-[#a08b74] transition-colors flex items-center gap-4 cursor-pointer">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-4 border-[#2a2118] shadow-inner flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Silver League</h3>
                <p className="text-[#a08b74] text-sm font-semibold">17th Place • 60 pts</p>
              </div>
            </div>

            {/* Friends Widget */}
            <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden">
              <div className="p-5 border-b border-[#3d2b1f] flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Friends</h3>
                <span className="bg-[#2a2118] px-2 py-0.5 rounded text-sm text-[#a08b74] font-bold">1</span>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-[#2a2118] cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-[#2a2118] rounded-xl border border-[#3d2b1f] flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <p className="font-bold text-white">Bot_Master99</p>
                  <p className="text-xs text-[#a08b74] font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Offline
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}