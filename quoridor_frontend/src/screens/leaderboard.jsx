// src/screens/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { getLeaderboard } from '../api';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard(50); // Fetch top 50
        setPlayers(res.data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-[#a08b74]">Loading Rankings...</div>;
  }

  // Helper for Top 3 styling
  const getRankStyle = (index) => {
    if (index === 0) return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]"; // Gold
    if (index === 1) return "text-gray-300 border-gray-400/50 bg-gray-400/10 shadow-[0_0_15px_rgba(156,163,175,0.2)]"; // Silver
    if (index === 2) return "text-amber-600 border-amber-600/50 bg-amber-600/10 shadow-[0_0_15px_rgba(217,119,6,0.2)]"; // Bronze
    return "text-[#a08b74] border-[#3d2b1f] bg-[#1a140f]"; // Standard
  };

  const getRankMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Global <span className="text-[#d4700a]">Leaderboard</span></h1>
          <p className="text-[#a08b74] text-lg">The greatest minds in the Maze. Will you claim the top spot?</p>
        </div>

        {/* Leaderboard Table Area */}
        <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden shadow-2xl">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[#a08b74] text-xs uppercase tracking-widest bg-[#201812] border-b border-[#3d2b1f]">
                  <th className="p-5 font-bold w-20 text-center">Rank</th>
                  <th className="p-5 font-bold">Challenger</th>
                  <th className="p-5 font-bold text-center">Elo Rating</th>
                  <th className="p-5 font-bold text-right hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => {
                  const isMe = String(player.id) === String(currentUser?.id);
                  const rankStyle = getRankStyle(index);

                  return (
                    <tr 
                      key={player.id} 
                      onClick={() => navigate(`/profile/${player.id}`)}
                      className={`border-b border-[#3d2b1f] hover:bg-[#2a2118] cursor-pointer transition-colors group ${isMe ? 'bg-[#2a2118]' : ''}`}
                    >
                      {/* Rank Column */}
                      <td className="p-4 text-center">
                        <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center font-extrabold border-2 ${rankStyle} ${isMe ? 'border-[#d4700a]' : ''}`}>
                          {getRankMedal(index)}
                        </div>
                      </td>

                      {/* Player Info Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl overflow-hidden ${isMe ? 'border-[#d4700a]' : 'border-[#3d2b1f] bg-[#2a2118]'}`}>
                            {player.profile ? <img src={player.profile} alt="avatar" className="w-full h-full object-cover"/> : '👤'}
                          </div>
                          <div>
                            <p className={`font-bold text-lg group-hover:text-[#d4700a] transition-colors ${isMe ? 'text-[#d4700a]' : 'text-white'}`}>
                              {player.name} {isMe && <span className="text-xs bg-[#d4700a] text-white px-2 py-0.5 rounded-full ml-2">YOU</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rating Column */}
                      <td className="p-4 text-center">
                        <span className="text-2xl font-extrabold text-[#f0d9b5] tracking-tight">
                          {player.rating}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="p-4 text-right text-[#a08b74] font-medium hidden sm:table-cell">
                        {new Date(player.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
                {players.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-[#a08b74]">No challengers found in the database yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}