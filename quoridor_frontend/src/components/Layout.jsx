// src/components/Layout.jsx
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; 

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation(); // 👉 Let's us know what page we are on

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); 
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // Helper to check if a path is active
    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#241c15] text-[#f0d9b5] font-sans overflow-hidden">
            
            {/* --- MINIMAL ICON SIDEBAR --- */}
            <aside className="w-16 sm:w-20 bg-[#1a140f] border-r border-[#3d2b1f] flex flex-col items-center py-6 justify-between shrink-0 z-50 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                
                {/* Top Section: Nav Icons */}
                <nav className="flex flex-col gap-4 w-full px-3">
                    
                    {/* Quoridor "Logo" (Top) */}
                    <Link to="/" className="w-full flex justify-center mb-6" title="Home">
                        <div className="w-full flex justify-center">
                            <div className="w-15 h-15 rounded-lg flex items-center justify-center shadow-lg border border-[#f08a1c]/30 overflow-hidden">
                                <img
                                    src="/logo.png"
                                    alt="Quoridor Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Play / Board Icon */}
                    <Link 
                        to="/board" 
                        className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                            isActive('/board') 
                                ? "bg-[#2a2118] border border-[#d4700a] text-[#d4700a] shadow-[0_0_15px_rgba(212,112,10,0.2)]" 
                                : "text-[#a08b74] hover:bg-[#2a2118] hover:text-[#f0d9b5] border border-transparent"
                        }`}
                        title="Play"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                    </Link>

                    {/* Profile Icon */}
                    <Link 
                        to="/profile" 
                        className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                            isActive('/profile') 
                                ? "bg-[#2a2118] border border-[#d4700a] text-[#d4700a] shadow-[0_0_15px_rgba(212,112,10,0.2)]" 
                                : "text-[#a08b74] hover:bg-[#2a2118] hover:text-[#f0d9b5] border border-transparent"
                        }`}
                        title="Profile"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </nav>

                {/* Bottom Section: Settings & Logout */}
                <div className="flex flex-col gap-4 w-full px-3">
                    
                    {/* Settings Icon (Placeholder for later) */}
                    <button 
                        className="w-full aspect-square flex items-center justify-center rounded-xl text-[#a08b74] hover:bg-[#2a2118] hover:text-[#f0d9b5] transition-all border border-transparent"
                        title="Settings"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Logout Icon */}
                    <button 
                        onClick={handleLogout}
                        className="w-full aspect-square flex items-center justify-center rounded-xl text-[#a08b74] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all border border-transparent"
                        title="Log Out"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>

                </div>
            </aside>

            {/* --- MAIN PAGE CONTENT --- */}
            {/* Added the subtle grid background here so it spans across every page nicely */}
            <main className="flex-1 relative overflow-y-auto bg-[#241c15]">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                
                {/* This div ensures content sits ON TOP of the background grid */}
                <div className="relative z-10 min-h-full">
                    {children} 
                </div>
            </main>
            
        </div>
    );
}