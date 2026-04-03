// src/screens/GameLobby.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import QuoridorBoard from "./quoridorBoard";

// Initialize socket outside the component to prevent multiple connections on re-render
const socket = io("https://quoridor-atzg.onrender.com/");

export default function GameLobby() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const rawMode = queryParams.get("mode");
    
    const botLevel = queryParams.get("level") || "2";
    // 👈 1. Check if we are playing the bot
    const isBotMode = rawMode === "bot"; 
    const searchMode = rawMode === "timed" ? "timed" : "standard";
    const navigate = useNavigate();

    const [status, setStatus] = useState("IDLE"); // IDLE, SEARCHING, PLAYING
    const [gameData, setGameData] = useState({ roomId: null, myRole: null });
    const [players, setPlayers] = useState({ p1: null, p2: null });
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const handleMatchFound = (data) => {
            setPlayers(data.players); 
            setGameData({ roomId: data.roomId, myRole: data.myRole });
            setStatus("PLAYING");
        };

        socket.on("match_found", handleMatchFound);

        return () => {
            socket.off("match_found", handleMatchFound);
        };
    }, []);

    // 👈 2. Instantly bypass matchmaking if it's Bot Mode!
    useEffect(() => {
        if (!currentUser) return;

        if (isBotMode) {
            // Instantly mock the player data and start the game
            setPlayers({
                p1: {
                    id: currentUser.id || currentUser.firebase_uid,
                    name: currentUser.name || "You",
                    rating: currentUser.rating || 1400,
                    profile: currentUser.profile
                },
                p2: {
                    id: "bot",
                    name: botLevel === "1" ? "Bot (Runner)" : botLevel === "2" ? "Bot (Blocker)" : "Bot (Mastermind)",
                    rating: botLevel === "1" ? 1000 : botLevel === "2" ? 1600 : 2500, 
                    profile: null 
                }
            });
            setGameData({ roomId: "local-bot-room", myRole: "p1" });
            setStatus("PLAYING");
        } 
        else if (status === "IDLE") {
            handleStartSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, isBotMode]); 

    const handleStartSearch = () => {
        if (!currentUser || isBotMode) return;
        setStatus("SEARCHING");
        
        socket.emit("start_search", { 
            userId: currentUser.firebase_uid || currentUser.id, 
            mode: searchMode 
        });
    };

    const handleCancelSearch = () => {
        setStatus("IDLE");
        socket.emit("cancel_search");
        navigate("/home"); 
    };

    if (status === "PLAYING") {
        return (
            <QuoridorBoard
                socket={socket}
                roomId={gameData.roomId}
                myRole={gameData.myRole}
                playerData={players} 
            />
        );
    }

    return (
        <div className="flex-1 w-full h-[calc(100vh-80px)] min-h-[600px] flex flex-col relative bg-[#0e0c0b]">
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {(status === "IDLE" || status === "SEARCHING") && (
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="bg-[#1a140f] p-10 rounded-3xl border border-[#3d2b1f] shadow-2xl flex flex-col items-center max-w-md w-full text-center">
                        
                        <div className="w-20 h-20 bg-[#2a2118] rounded-2xl flex items-center justify-center text-4xl mb-6 border border-[#3d2b1f]">
                            {searchMode === 'timed' ? '⏱️' : '♟️'}
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white mb-2">
                            {searchMode === 'timed' ? 'Rapid Match' : 'Classic Match'}
                        </h2>
                        
                        {status === "IDLE" ? (
                            <>
                                <p className="text-[#a08b74] mb-8">Ready to enter the maze?</p>
                                <button 
                                    onClick={handleStartSearch} 
                                    className="w-full bg-[#d4700a] hover:bg-[#f08a1c] text-white py-4 rounded-xl font-bold text-lg shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all"
                                >
                                    Find Opponent
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-[#d4700a] font-bold mb-8 animate-pulse">Searching the database...</p>
                                <div className="w-12 h-12 border-4 border-[#3d2b1f] border-t-[#d4700a] rounded-full animate-spin mb-8"></div>
                                <button 
                                    onClick={handleCancelSearch} 
                                    className="w-full bg-[#2a2118] hover:bg-[#3d2b1f] text-[#a08b74] py-4 rounded-xl font-bold transition-colors border border-[#3d2b1f]"
                                >
                                    Cancel Search
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}