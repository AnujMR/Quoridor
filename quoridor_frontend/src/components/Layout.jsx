// src/components/Layout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path if needed

export default function Layout({ children }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // After logging out, Firebase updates the AuthContext, 
            // and we send the user back to the login screen
            navigate('/login'); 
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#241c15] flex flex-col font-sans">
            
            {/* --- TOP NAVIGATION BAR --- */}
            <header className="bg-[#1a140f] border-b border-[#3d2b1f] px-6 py-4 flex justify-between items-center shadow-md z-50">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(212,112,10,0.5)]">
                        Quoridor
                    </h1>
                </div>

                <nav className="flex items-center gap-4">
                    {/* Add links to other pages later here if you want! */}
                    <button 
                        onClick={handleLogout}
                        className="bg-[#2a2118] hover:bg-[#3d2b1f] text-[#f0d9b5] border border-[#3d2b1f] px-5 py-2 rounded-lg font-bold transition-all active:scale-95"
                    >
                        Log Out
                    </button>
                </nav>
            </header>

            {/* --- MAIN PAGE CONTENT --- */}
            <main className="flex-1 relative overflow-y-auto">
                {/* 👇 THIS IS THE MAGIC WORD! This tells Layout where to draw the HomePage, Board, etc. */}
                {children} 
            </main>
            
        </div>
    );
}