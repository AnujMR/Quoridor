// src/screens/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  getFriendsList, 
  getPendingRequests,
  getSentRequests, // 👈 Imported the new API call
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  searchUsersByName, // Import the new search function
  getGameHistory,
  getUserById
} from '../api';

export default function ProfilePage() {
  const { userId } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  // NEW: Game History States
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // --- NEW STATE FOR FRIENDS SYSTEM ---
  // --- DYNAMIC PROFILE STATE ---
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Is this the logged-in user's profile, or a friend's?
  const isOwnProfile = !userId || String(userId) === String(currentUser?.id);

  const [activeTab, setActiveTab] = useState('Overview');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // 👈 State for sent requests
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- NEW: UI/UX STATES ---
  const [toast, setToast] = useState(null); 
  const [friendToRemove, setFriendToRemove] = useState(null); 

  // Helper function to show beautiful toast popups
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto-hide after 3s
  };

  // NEW: Fetch Game History Function
  const fetchHistoryData = async () => {
    if (!currentUser?.firebase_uid) return;
    setIsLoadingHistory(true);
    try {
      const res = await getGameHistory(currentUser?.firebase_uid);
      // Sort history so the newest games are at the top
      const sortedHistory = (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setGameHistory(sortedHistory);
    } catch (err) {
      console.error("Failed to fetch game history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // --- INITIAL DATA FETCH ---
  const fetchFriendsData = async () => {
    if (!currentUser?.id) return;
    try {
      const friendsRes = await getFriendsList(currentUser.id);
      setFriends(friendsRes.data);

      const requestsRes = await getPendingRequests(currentUser.id);
      setPendingRequests(requestsRes.data);
    } catch (error) {
      console.error("Error fetching friends data:", error);
    }
  };

  // Run once when component mounts or currentUser changes
  useEffect(() => {
    fetchFriendsData();
    fetchHistoryData();
  }, [currentUser?.id]);
  useEffect(() => {
    setActiveTab('Overview');
  }, [userId]);

  // --- FETCH PROFILE DATA ---
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        let targetUserId;
        
        if (isOwnProfile) {
          setProfileUser(currentUser);
          targetUserId = currentUser?.id;
        } else {
          const res = await getUserById(userId);
          setProfileUser(res.data);
          targetUserId = userId;
        }

        if (targetUserId) {
          const friendsRes = await getFriendsList(targetUserId);
          setFriends(friendsRes.data);

          // ONLY fetch pending and sent requests if we are looking at our own profile
          if (isOwnProfile) {
            const requestsRes = await getPendingRequests(targetUserId);
            setPendingRequests(requestsRes.data);
            
            const sentRes = await getSentRequests(targetUserId);
            setSentRequests(sentRes.data);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      loadProfile();
    }
  }, [userId, currentUser, isOwnProfile]);

  // --- DEBOUNCED SEARCH EFFECT ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchUsersByName(searchQuery);
        // Filter out ourselves AND people we already sent a request to
        const sentIds = sentRequests.map(req => req.receiver_id);
        const filteredResults = res.data.filter(u => u.id !== currentUser.id && !sentIds.includes(u.id));
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser?.id, sentRequests]);


  // --- ACTION HANDLERS (Replaced alerts with Toasts) ---
  const handleSendRequest = async (receiverId) => {
    try {
      await sendFriendRequest({ senderId: currentUser.id, receiverId });
      showToast("Friend request sent!");
      setSearchQuery(''); 
      // Refresh sent requests
      const sentRes = await getSentRequests(currentUser.id);
      setSentRequests(sentRes.data);
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to send request", "error");
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await acceptFriendRequest({ senderId, receiverId: currentUser.id });
      showToast("Friend request accepted!");
      const friendsRes = await getFriendsList(currentUser.id);
      setFriends(friendsRes.data);
      const requestsRes = await getPendingRequests(currentUser.id);
      setPendingRequests(requestsRes.data);
    } catch (error) {
      showToast("Failed to accept request", "error");
    }
  };

  const handleReject = async (senderId) => {
    try {
      await rejectFriendRequest({ senderId, receiverId: currentUser.id });
      showToast("Friend request rejected.", "error");
      const requestsRes = await getPendingRequests(currentUser.id);
      setPendingRequests(requestsRes.data);
    } catch (error) {
      showToast("Failed to reject request", "error");
    }
  };

  // 👈 New Custom Remove Flow (Replaces window.confirm)
  const confirmAndRemoveFriend = async () => {
    if (!friendToRemove) return;
    try {
      await removeFriend({ user1: currentUser.id, user2: friendToRemove.id });
      showToast(`Removed ${friendToRemove.name} from friends.`, "error");
      const friendsRes = await getFriendsList(currentUser.id);
      setFriends(friendsRes.data);
    } catch (error) {
      showToast("Failed to remove friend", "error");
    } finally {
      setFriendToRemove(null); // Close modal
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-[#a08b74]">Loading Profile...</div>;
  }

  if (!profileUser) {
    return <div className="flex h-screen items-center justify-center text-[#a08b74]">User not found.</div>;
  }

  const displayName = profileUser?.name || profileUser?.email?.split('@')[0] || 'Challenger';
  const photoURL = profileUser?.profile || '/default-avatar.png';
  const joinDate = profileUser?.created_at 
    ? new Date(profileUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Unknown Date';

  // 👉 NEW: Pagination calculations
  const totalHistoryPages = Math.max(1, Math.ceil(gameHistory.length / ITEMS_PER_PAGE));
  const paginatedHistory = gameHistory.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  );

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      
      {/* 👈 CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border z-50 animate-bounce transition-all ${
          toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-green-900/90 border-green-500 text-green-100'
        }`}>
          <p className="font-bold flex items-center gap-2">
            {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
          </p>
        </div>
      )}

      {/* 👈 CUSTOM REMOVE CONFIRMATION MODAL */}
      {friendToRemove && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a140f] p-8 rounded-2xl border border-[#3d2b1f] max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-4">💔</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Remove Friend?</h2>
            <p className="text-[#a08b74] mb-8">Are you sure you want to remove <strong className="text-white">{friendToRemove.name}</strong> from your friends list?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setFriendToRemove(null)}
                className="flex-1 bg-[#2a2118] hover:bg-[#3d2b1f] text-white py-3 rounded-xl font-bold transition-colors border border-[#3d2b1f]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAndRemoveFriend}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-[0_4px_0_#7f1d1d] active:translate-y-1 active:shadow-none transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- 1. PROFILE HEADER --- */}
        <div className="bg-[#1a140f] rounded-t-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-[#3d2b1f]">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#2a2118] rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[#d4700a] shadow-[0_0_15px_rgba(212,112,10,0.2)]">
            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-3xl font-extrabold mb-2 text-white">{displayName}</h1>
            <div className="text-sm text-[#a08b74] flex flex-wrap items-center gap-x-4 gap-y-2">
              <span><strong className="text-[#f0d9b5]">{joinDate}</strong> Joined</span>
              <span><strong className="text-[#f0d9b5]">{friends.length}</strong> Friends</span>
              <span><strong className="text-[#f0d9b5]">{profileUser.rating || 1200}</strong> Elo</span>
            </div>
          </div>
          
          {/* Add Friend Button in Header (Only if it's not our own profile) */}
          {!isOwnProfile && (
            <button 
              onClick={() => handleSendRequest(profileUser.id)}
              className="bg-[#d4700a] hover:bg-[#f08a1c] text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap"
            >
              Add Friend
            </button>
          )}
        </div>

        {/* --- 2. TABS NAVIGATION --- */}
        <div className="bg-[#1a140f] rounded-b-2xl px-6 flex overflow-x-auto border-b-4 border-[#1a140f]">
          {['Overview', 'Games', 'Stats', 'Friends', 'Awards', 'Clubs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-[#d4700a] text-white' : 'border-transparent text-[#a08b74] hover:text-[#f0d9b5]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- 3. MAIN CONTENT AREA --- */}
        <div className="mt-6">
          
          {/* ===================== OVERVIEW TAB ===================== */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#1a140f] p-5 rounded-2xl border border-[#3d2b1f] hover:border-[#a08b74] cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-[#2a2118] p-3 rounded-xl border border-[#3d2b1f] group-hover:bg-[#3d2b1f] transition-colors text-xl">🏆</div>
                      <div>
                        <h3 className="text-[#a08b74] text-sm font-bold uppercase tracking-wider">Ranked Elo</h3>
                        <p className="text-3xl font-extrabold text-white">{profileUser.rating || 1200}</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#3d2b1f] mt-2 relative rounded-full overflow-hidden">
                       <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-[#d4700a] to-[#f08a1c] rounded-full"></div>
                    </div>
                  </div>

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
                    <div className="w-full h-1.5 bg-[#3d2b1f] mt-2 relative rounded-full overflow-hidden">
                       <div className="absolute top-0 left-0 h-full w-4/5 bg-gradient-to-r from-[#d4700a] to-[#f08a1c] rounded-full"></div>
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="bg-[#1a140f] p-6 rounded-2xl border border-[#3d2b1f] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold mb-1 text-white">Active Matches <span className="text-[#a08b74] font-normal">(0)</span></h2>
                      <p className="text-[#a08b74] text-sm">You have no ongoing asynchronous games.</p>
                    </div>
                    <Link to="/board" className="bg-[#d4700a] hover:bg-[#f08a1c] text-white px-8 py-3 rounded-xl font-bold shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap">
                      Find Match
                    </Link>
                  </div>
                )}

                {/* Game History Table */}
                {/* --- GAME HISTORY TABLE --- */}
                <div className="bg-[#1a140f] border border-[#3d2b1f] rounded-xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4700a]/5 rounded-bl-full -z-10 group-hover:bg-[#d4700a]/10 transition-colors"></div>
                  <h2 className="text-[#d4700a] text-xl font-bold mb-6 flex items-center gap-2">
                    📜 Game History
                  </h2>

                  <div className="overflow-x-auto">
                    {isLoadingHistory ? (
                      <p className="text-[#a08b74] text-center py-4">Loading history...</p>
                    ) : gameHistory.length === 0 ? (
                      <p className="text-[#a08b74] text-center py-4">No games played yet.</p>
                    ) : (
                      <>
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="border-b border-[#3d2b1f] text-[#a08b74] text-sm">
                              <th className="pb-3 font-medium">Date</th>
                              <th className="pb-3 font-medium">Opponent</th>
                              <th className="pb-3 font-medium">Type</th>
                              <th className="pb-3 font-medium">Result</th>
                              <th className="pb-3 font-medium text-right">Moves</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {paginatedHistory.map((game) => {
                              // 1. Determine opponent ID
                              const isP1 = String(game.player1_id) === String(currentUser?.firebase_uid);

                              // 2. Determine Win/Loss/Draw
                              let resultText = 'Draw';
                              let resultColor = 'text-[#a08b74]';
                              let resultBg = 'bg-[#2a2118]';

                              if (game.winner_id) {
                                if (String(game.winner_id) === String(currentUser?.firebase_uid)) {
                                  resultText = 'Win';
                                  resultColor = 'text-green-400';
                                  resultBg = 'bg-green-500/10';
                                } else {
                                  resultText = 'Loss';
                                  resultColor = 'text-red-400';
                                  resultBg = 'bg-red-500/10';
                                }
                              }

                              // 3. Format the date
                              const dateStr = new Date(game.completed_at || game.created_at).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                              });

                              return (
                                <tr key={game.game_id} className="border-b border-[#3d2b1f]/50 last:border-0 hover:bg-[#2a2118]/30 transition-colors">
                                  <td className="py-4 text-[#f0d9b5] whitespace-nowrap">{dateStr}</td>
                                  <td className="py-4 font-medium text-[#d4700a]">
                                    {/* Note: If your backend joins the users table, you can map 'game.opponent_name' here instead */}
                                    {isP1 ? `${game.player2_name || 'Unknown Opponent'}` : `${game.player1_name || 'Unknown Opponent'}`}
                                  </td>
                                  <td className="py-4 text-[#a08b74] capitalize">{game.game_type || 'Standard'}</td>
                                  <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${resultBg} ${resultColor}`}>
                                      {resultText}
                                    </span>
                                  </td>
                                  <td className="py-4 text-right text-[#f0d9b5] font-mono">{game.moves_count}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* 👉 NEW: Pagination Controls */}
                        {totalHistoryPages > 1 && (
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#3d2b1f]">
                            <button
                              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                              disabled={historyPage === 1}
                              className="px-4 py-2 bg-[#2a2118] hover:bg-[#3d2b1f] disabled:opacity-50 disabled:cursor-not-allowed text-[#f0d9b5] text-sm font-bold rounded-lg transition-colors"
                            >
                              &larr; Prev
                            </button>
                            <span className="text-[#a08b74] text-sm font-medium">
                              Page {historyPage} of {totalHistoryPages}
                            </span>
                            <button
                              onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                              disabled={historyPage === totalHistoryPages}
                              className="px-4 py-2 bg-[#2a2118] hover:bg-[#3d2b1f] disabled:opacity-50 disabled:cursor-not-allowed text-[#f0d9b5] text-sm font-bold rounded-lg transition-colors"
                            >
                              Next &rarr;
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-[#1a140f] p-5 rounded-2xl border border-[#3d2b1f] hover:border-[#a08b74] transition-colors flex items-center gap-4 cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-4 border-[#2a2118] shadow-inner flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Silver League</h3>
                    <p className="text-[#a08b74] text-sm font-semibold">17th Place • 60 pts</p>
                  </div>
                </div>

                <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden">
                  <div className="p-5 border-b border-[#3d2b1f] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Friends</h3>
                    <span className="bg-[#2a2118] px-2 py-0.5 rounded text-sm text-[#a08b74] font-bold">{friends.length}</span>
                  </div>
                  {friends.slice(0, 3).map(friend => (
                    <div 
                      key={friend.id} 
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      className="p-4 flex items-center gap-4 hover:bg-[#2a2118] cursor-pointer transition-colors border-b border-[#3d2b1f] last:border-0"
                    >
                      <div className="w-12 h-12 bg-[#2a2118] rounded-xl border border-[#3d2b1f] overflow-hidden flex items-center justify-center text-xl">
                        {friend.profile ? <img src={friend.profile} alt="friend" className="w-full h-full object-cover"/> : '👤'}
                      </div>
                      <div>
                        <p className="font-bold text-white hover:text-[#d4700a] transition-colors">{friend.name}</p>
                        <p className="text-xs text-[#a08b74] font-semibold mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                        </p>
                      </div>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="p-4 text-center text-[#a08b74] text-sm">No friends yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== FRIENDS TAB ===================== */}
          {activeTab === 'Friends' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-6">
                
                {/* ONLY SHOW ADD FRIEND BOX ON OWN PROFILE */}
                {isOwnProfile && (
                  <div className="bg-[#1a140f] p-6 rounded-2xl border border-[#3d2b1f]">
                    <h2 className="text-xl font-extrabold mb-4 text-white">Add a Friend</h2>
                    <div className="flex flex-col gap-3 relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by name..." 
                        className="w-full bg-[#2a2118] border border-[#3d2b1f] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#d4700a] transition-colors placeholder-[#a08b74]"
                      />
                      
                      {searchQuery.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a2118] border border-[#3d2b1f] rounded-xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto">
                          {isSearching ? (
                            <div className="p-4 text-center text-[#a08b74] text-sm">Searching...</div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map(user => (
                              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-[#3d2b1f] transition-colors border-b border-[#3d2b1f] last:border-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#1a140f] rounded-full flex items-center justify-center text-xs">👤</div>
                                  <span className="font-bold text-white text-sm">{user.name}</span>
                                </div>
                                <button 
                                  onClick={() => handleSendRequest(user.id)}
                                  className="bg-[#d4700a] hover:bg-[#f08a1c] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                >
                                  Add
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-[#a08b74] text-sm">No users found.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CURRENT FRIENDS LIST */}
                <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden">
                  <div className="p-5 border-b border-[#3d2b1f]">
                    <h2 className="text-xl font-extrabold text-white">
                      {isOwnProfile ? "My Friends" : `${displayName}'s Friends`} <span className="text-[#a08b74] font-normal text-lg">({friends.length})</span>
                    </h2>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    {friends.map((friend) => (
                      <div 
                        key={friend.id} 
                        onClick={() => navigate(`/profile/${friend.id}`)} 
                        className="flex items-center justify-between p-4 hover:bg-[#2a2118] rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#2a2118] rounded-xl border border-[#3d2b1f] flex items-center justify-center text-xl overflow-hidden">
                            {friend.profile ? <img src={friend.profile} alt="friend" className="w-full h-full object-cover"/> : '👤'}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-[#d4700a] transition-colors">{friend.name}</p>
                            <p className="text-xs text-[#a08b74] font-semibold mt-0.5">Rating: {friend.rating}</p>
                          </div>
                        </div>
                        
                        {/* 👈 Replaced direct remove with Modal trigger */}
                        {isOwnProfile && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFriendToRemove(friend); }}
                            className="text-[#a08b74] hover:text-red-500 font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {friends.length === 0 && (
                      <p className="p-6 text-center text-[#a08b74]">
                        {isOwnProfile ? "You have no friends yet." : `${displayName} has no friends yet.`}
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-6">
                
                {/* RECEIVED REQUESTS */}
                {isOwnProfile && (
                  <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden">
                    <div className="p-5 border-b border-[#3d2b1f]">
                      <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        Received Requests 
                        {pendingRequests.length > 0 && (
                          <span className="bg-[#d4700a] text-white text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                        )}
                      </h2>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-2">
                      {pendingRequests.map((request) => (
                        <div key={request.request_id} className="flex items-center justify-between p-4 bg-[#201812] rounded-xl border border-[#3d2b1f]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#2a2118] rounded-full flex items-center justify-center text-xl overflow-hidden">
                              {request.profile ? <img src={request.profile} alt="sender" className="w-full h-full object-cover"/> : '👤'}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{request.name}</p>
                              <p className="text-xs text-[#a08b74] font-semibold">Rating: {request.rating}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleAccept(request.sender_id)} className="bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                              Accept
                            </button>
                            <button onClick={() => handleReject(request.sender_id)} className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingRequests.length === 0 && (
                        <p className="p-6 text-center text-[#a08b74]">No pending requests.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 👈 NEW: SENT REQUESTS */}
                {isOwnProfile && (
                  <div className="bg-[#1a140f] rounded-2xl border border-[#3d2b1f] overflow-hidden">
                    <div className="p-5 border-b border-[#3d2b1f]">
                      <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        Sent Requests 
                        {sentRequests.length > 0 && (
                          <span className="bg-[#a08b74] text-[#1a140f] text-xs px-2 py-0.5 rounded-full">{sentRequests.length}</span>
                        )}
                      </h2>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-2">
                      {sentRequests.map((request) => (
                        <div key={request.request_id} className="flex items-center justify-between p-4 bg-[#201812] rounded-xl border border-[#3d2b1f] opacity-75">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#2a2118] rounded-full flex items-center justify-center text-xl overflow-hidden">
                              {request.profile ? <img src={request.profile} alt="receiver" className="w-full h-full object-cover"/> : '👤'}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{request.name}</p>
                              <p className="text-xs text-[#a08b74] font-semibold">Waiting for response...</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sentRequests.length === 0 && (
                        <p className="p-6 text-center text-[#a08b74]">You haven't sent any requests.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}