// src/screens/HomePage.jsx
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';
import { getUserById } from '../api';

export default function HomePage() {
  // const [user, setUser] = useState(null);
  const currentUser = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const refreshUserData = async () => {
      if (currentUser?.firebase_uid) {
        const res = await getUserById(currentUser.firebase_uid);
        login(res.data); // Silent update in the background
      }
    };
    refreshUserData();
  }, [currentUser?.firebase_uid, login ]);

  // Fetch the logged-in user from Firebase
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //   });
  //   return () => unsubscribe();
  // }, []);

  // Fallbacks just in case the user hasn't set up a display name or photo yet
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Challenger';
  const photoURL = currentUser?.profile || '/default_profile.jpg';
  

  return (
    // Note: No more full-screen wrapper or sidebar here! 
    // Layout.jsx handles that for us. We just return the <main> content.
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
              <p className="font-bold text-sm">Rating: {currentUser?.rating || 1400}</p>
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
                <h2 className="text-4xl font-extrabold mb-2 text-white">Classic Match</h2>
                <p className="text-[#f0d9b5]/70 text-lg mb-8 max-w-sm">Find an opponent, place your walls wisely, and race to the other side at your own pace.</p>
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
            <Link to="/board?mode=bot" className="w-full bg-[#2a2118] hover:bg-[#3d2b1f] border border-[#3d2b1f] text-center py-3 rounded-xl font-bold transition-colors">
              Challenge Bot
            </Link>
          </div>
        </div>

        {/* BOTTOM ROW: Secondary Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Play with a Friend */}
          <Link to="/board?mode=friend" className="bg-[#1a140f] border border-[#3d2b1f] p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#201812] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#2a2118] rounded-full flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🤝</div>
              <div>
                <h3 className="text-lg font-bold">Play with a Friend</h3>
                <p className="text-[#a08b74] text-sm">Create a private room link</p>
              </div>
            </div>
            <div className="text-[#d4700a] text-2xl">›</div>
          </Link>

          {/* NEW: Timed Match */}
          <Link to="/board?mode=timed" className="bg-[#1a140f] border border-[#3d2b1f] p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-[#201812] transition-colors relative overflow-hidden">
            {/* Subtle pulsing background effect for the timed mode */}
            <div className="absolute inset-0 bg-[#d4700a]/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-[#2a2118] rounded-full flex items-center justify-center text-2xl group-hover:-rotate-12 transition-transform border border-[#d4700a]/30">⏱️</div>
              <div>
                <h3 className="text-lg font-bold text-white">Rapid Match (10 Min)</h3>
                <p className="text-[#d4700a] font-semibold text-sm">Test your speed under pressure</p>
              </div>
            </div>
            <div className="text-[#d4700a] text-2xl relative z-10">›</div>
          </Link>

        </div>

      </div>
    </main>
  );
}