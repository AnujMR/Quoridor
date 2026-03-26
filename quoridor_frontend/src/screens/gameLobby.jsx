// import { useState } from "react";
import QuoridorBoard from "./quoridorBoard";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";

// Initialize socket outside the component to prevent multiple connections on re-render
const socket = io("http://localhost:5000");

export default function GameLobby() {
    const [status, setStatus] = useState("IDLE"); // IDLE, SEARCHING, PLAYING
    const [gameData, setGameData] = useState({ roomId: null, myRole: null });
    const [players, setPlayers] = useState({ p1: null, p2: null });
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        socket.on("match_found", (data) => {
            setPlayers(data.players); // This contains { p1: {...}, p2: {...} }
            setGameData({ roomId: data.roomId, myRole: data.myRole });
            setStatus("PLAYING");
        });
    }, []);

    useEffect(() => {
        // Listen for the match event from the Node.js server
        socket.on("match_found", (data) => {
            setGameData({
                roomId: data.roomId,
                myRole: data.myRole, // 'p1' or 'p2'
            });
            setStatus("PLAYING");
        });

        return () => {
            socket.off("match_found");
        };
    }, []);

    const handleStartSearch = () => {
        setStatus("SEARCHING");
        if (!currentUser) {
            return;
        }
        socket.emit("start_search", { userId: currentUser.firebase_uid });
    };

    return (
        <div className="app-container">
            {status === "IDLE" && (
                <div className="lobby">
                    <h1>Quoridor Online</h1>
                    <button onClick={handleStartSearch} className="play-button">
                        PLAY
                    </button>
                </div>
            )}

            {status === "SEARCHING" && (
                <div className="loader">
                    <h2>Finding opponent...</h2>
                    <div className="spinner"></div>
                    <button onClick={() => setStatus("IDLE")}>Cancel</button>
                </div>
            )}

            {status === "PLAYING" && (
                <QuoridorBoard
                    socket={socket}
                    roomId={gameData.roomId}
                    myRole={gameData.myRole}
                    playerData={players} // Pass the new profiles here!
                />
            )}
        </div>
    );
}