import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, useBlocker } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

// Grid Size
const N = 9; 

// Converts row/col to standard Quoridor notation (e.g., e4, f5h, c3v)
const coordsToNotation = (r, c, type = "") => {
  const colStr = String.fromCharCode(97 + c); // 0 -> 'a'
  const rowStr = N - r; // 8 -> 1 (Bottom row is 1)
  return `${colStr}${rowStr}${type}`;
};

// BFS Pathfinding
function hasPath(sr, sc, goalRows, hWalls, vWalls) {
  const visited = new Set();
  const queue = [[sr, sc]];
  visited.add(`${sr},${sc}`);
  while (queue.length) {
    const [r, c] = queue.shift();
    if (goalRows.includes(r)) return true;
    for (const [nr, nc] of neighbors(r, c, hWalls, vWalls)) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

function neighbors(r, c, hWalls, vWalls) {
  const result = [];
  if (r > 0 && !isHWallBlocking(r, c, "up", hWalls)) result.push([r - 1, c]);
  if (r < N - 1 && !isHWallBlocking(r, c, "down", hWalls)) result.push([r + 1, c]);
  if (c > 0 && !isVWallBlocking(r, c, "left", vWalls)) result.push([r, c - 1]);
  if (c < N - 1 && !isVWallBlocking(r, c, "right", vWalls)) result.push([r, c + 1]);
  return result;
}

function isHWallBlocking(r, c, dir, hWalls) {
  if (dir === "down") return hWalls.has(`${r},${c}`) || hWalls.has(`${r},${c - 1}`);
  else return hWalls.has(`${r - 1},${c}`) || hWalls.has(`${r - 1},${c - 1}`);
}

function isVWallBlocking(r, c, dir, vWalls) {
  if (dir === "right") return vWalls.has(`${r},${c}`) || vWalls.has(`${r - 1},${c}`);
  else return vWalls.has(`${r},${c - 1}`) || vWalls.has(`${r - 1},${c - 1}`);
}

// Wall Validity
function canPlaceHWall(r, c, hWalls, vWalls, p1, p2) {
  if (r < 0 || r > N - 2 || c < 0 || c > N - 2) return false;
  if (hWalls.has(`${r},${c}`) || hWalls.has(`${r},${c - 1}`) || hWalls.has(`${r},${c + 1}`)) return false; 
  if (vWalls.has(`${r},${c}`)) return false;
  const nh = new Set(hWalls).add(`${r},${c}`);
  return hasPath(p1.row, p1.col, [0], nh, vWalls) && hasPath(p2.row, p2.col, [N - 1], nh, vWalls);
}

function canPlaceVWall(r, c, hWalls, vWalls, p1, p2) {
  if (r < 0 || r > N - 2 || c < 0 || c > N - 2) return false;
  if (vWalls.has(`${r},${c}`) || vWalls.has(`${r - 1},${c}`) || vWalls.has(`${r + 1},${c}`)) return false;
  if (hWalls.has(`${r},${c}`)) return false;
  const nv = new Set(vWalls).add(`${r},${c}`);
  return hasPath(p1.row, p1.col, [0], hWalls, nv) && hasPath(p2.row, p2.col, [N - 1], hWalls, nv);
}

// Move Validation
function getValidMoves(cur, opp, hWalls, vWalls) {
  const moves = new Set();
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = cur.row + dr;
    const nc = cur.col + dc;
    if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
    if (dr === -1 && isHWallBlocking(cur.row, cur.col, "up", hWalls)) continue;
    if (dr === 1  && isHWallBlocking(cur.row, cur.col, "down", hWalls)) continue;
    if (dc === -1 && isVWallBlocking(cur.row, cur.col, "left", vWalls)) continue;
    if (dc === 1  && isVWallBlocking(cur.row, cur.col, "right", vWalls)) continue;
    
    if (nr === opp.row && nc === opp.col) {
      const jr = nr + dr;
      const jc = nc + dc;
      if (jr >= 0 && jr < N && jc >= 0 && jc < N) {
        const blocked =
          (dr === -1 && isHWallBlocking(nr, nc, "up", hWalls)) ||
          (dr === 1  && isHWallBlocking(nr, nc, "down", hWalls)) ||
          (dc === -1 && isVWallBlocking(nr, nc, "left", vWalls)) ||
          (dc === 1  && isVWallBlocking(nr, nc, "right", vWalls));
        if (!blocked) { moves.add(`${jr},${jc}`); continue; }
      }
      for (const [sr, sc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        if (sr === -dr && sc === -dc) continue; 
        const sr2 = nr + sr, sc2 = nc + sc;
        if (sr2 < 0 || sr2 >= N || sc2 < 0 || sc2 >= N) continue;
        const sblocked =
          (sr === -1 && isHWallBlocking(nr, nc, "up", hWalls)) ||
          (sr === 1  && isHWallBlocking(nr, nc, "down", hWalls)) ||
          (sc === -1 && isVWallBlocking(nr, nc, "left", vWalls)) ||
          (sc === 1  && isVWallBlocking(nr, nc, "right", vWalls));
        if (!sblocked) moves.add(`${sr2},${sc2}`);
      }
      continue;
    }
    moves.add(`${nr},${nc}`);
  }
  return moves;
}

function initState() {
  return {
    p1: { row: 8, col: 4, walls: 10 },
    p2: { row: 0, col: 4, walls: 10 },
    turn: "p1",
    hWalls: new Set(),
    vWalls: new Set(),
    winner: null,
    moveHistory: [], 
  };
}

// Helper to format ms into MM:SS
const formatTime = (ms) => {
  if (ms === null || ms === undefined) return "--:--";
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

//  Main Component
export default function QuoridorBoard({ socket, roomId, myRole, playerData}) {
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  // Reading URL parameters to toggle Timed Mode
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isTimedMode = queryParams.get("mode") === "timed";
  const navigate = useNavigate();

  const [state, setState] = useState(initState);
  const [mode, setMode] = useState("move"); 
  const [hovered, setHovered] = useState(null); 
  const [selected, setSelected] = useState(false); 
  const [rightTab, setRightTab] = useState("chat");

  // --- TIMER STATES ---
  const [clocks, setClocks] = useState({ p1: null, p2: null });
  const [lastSyncTime, setLastSyncTime] = useState(null); 
  const [isClockRunning, setIsClockRunning] = useState(false);
  
  const draggingRef = useRef(false);
  const chatEndRef = useRef(null);
  const movesEndRef = useRef(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    { sender: "System", text: "Match started. Good luck!" }
  ]);

  // --- AUTO-SCROLL EFFECT ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  const [winReason, setWinReason] = useState(null); // 'normal' | 'forfeit' | 'timeout'
  const [ratingUpdates, setRatingUpdates] = useState(null);

  const cur = state.turn === "p1" ? state.p1 : state.p2;
  const opp = state.turn === "p1" ? state.p2 : state.p1;
  const validMoves = state.winner ? new Set() : getValidMoves(cur, opp, state.hWalls, state.vWalls);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const executeMove = useCallback((r, c, isFromSocket = false) => {
    setState(prev => {
      const notation = coordsToNotation(r, c);
      const ns = {
        ...prev,
        [prev.turn]: { ...prev[prev.turn], row: r, col: c },
        turn: prev.turn === "p1" ? "p2" : "p1",
        moveHistory: [...prev.moveHistory, notation]
      };
      if (prev.turn === "p1" && r === 0) ns.winner = "p1";
      if (prev.turn === "p2" && r === N - 1) ns.winner = "p2";
      return ns;
    });
    setSelected(false);
    draggingRef.current = false;
    const isWin = (myRole === "p1" && r === 0) || (myRole === "p2" && r === N - 1);

    if (!isFromSocket && socket) {
      socket.emit("game_action", {
        roomId,
        action: { type: "PAWN_MOVE", r, c, isWin: isWin },
      });
      // Tell local ticker to start counting opponent's time
      setLastSyncTime(Date.now());
    }
  }, [socket, roomId, myRole]);


  const handleWallClick = useCallback((type, r, c, isFromSocket = false) => {
    if (state.winner || cur.walls <= 0) return;

    if (!isFromSocket) {
      const ok = type === "h"
        ? canPlaceHWall(r, c, state.hWalls, state.vWalls, state.p1, state.p2)
        : canPlaceVWall(r, c, state.hWalls, state.vWalls, state.p1, state.p2);
      if (!ok) return;
    }

    setState(prev => {
      const notation = coordsToNotation(r, c, type);
      const newWalls = type === "h"
        ? new Set(prev.hWalls).add(`${r},${c}`)
        : new Set(prev.vWalls).add(`${r},${c}`);
      return {
        ...prev,
        [prev.turn]: { ...prev[prev.turn], walls: prev[prev.turn].walls - 1 },
        turn: prev.turn === "p1" ? "p2" : "p1",
        ...(type === "h" ? { hWalls: newWalls } : { vWalls: newWalls }),
        moveHistory: [...prev.moveHistory, notation]
      };
    });

    if (!isFromSocket && socket) {
      socket.emit("game_action", {
        roomId,
        action: { type: "WALL_PLACE", wallType: type, r, c, isWin: false }
      });
      // Tell local ticker to start counting opponent's time
      setLastSyncTime(Date.now());
    }
  }, [state, cur, socket, roomId]);

  // Checking if the current game turn matches the local player's role
  const isMyTurn = state.turn === myRole;

  // Ref to track the latest winner status
  const winnerRef = useRef(state.winner);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !winnerRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  // Keeping the ref in sync with state
  useEffect(() => {
    winnerRef.current = state.winner;
    if (state.winner) setIsClockRunning(false); // Stop clocks if game over
  }, [state.winner]);

  useEffect(() => {
    return () => {
      if (socket && !winnerRef.current) {
        socket.emit("leave_room", { roomId });
      }
    };
  }, [socket, roomId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!winnerRef.current) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Telling the server who is playing in this room
  useEffect(() => {
    if (socket && roomId && playerData?.[myRole]?.id) {
      socket.emit("join_game", {
        roomId,
        uid: playerData[myRole].id,
        game_type: isTimedMode ? "rapid" : "untimed", // Send correct type to server
        created_at: new Date()
      });
    }
  }, [socket, roomId, playerData, myRole, isTimedMode]);

  // --- THE SMOOTH VISUAL TICKER ---
  useEffect(() => {
    if (!isTimedMode || !isClockRunning || state.winner || !lastSyncTime) return;

    const intervalId = setInterval(() => {
      setClocks(prev => {
        const timeElapsed = Date.now() - lastSyncTime;
        return {
          ...prev,
          [state.turn]: Math.max(0, prev[state.turn] - timeElapsed)
        };
      });
      setLastSyncTime(Date.now());
    }, 100);

    return () => clearInterval(intervalId);
  }, [isTimedMode, isClockRunning, state.winner, state.turn, lastSyncTime]);

  // --- SOCKET LISTENERS (Combined & Updated for Timers) ---
  useEffect(() => {
    if (!socket) return;

    const handleGameOver = (data) => {
      const winnerRole = data.winnerUid === playerData?.p1?.id ? "p1" : "p2";
      setState(prev => ({ ...prev, winner: winnerRole }));
      setWinReason(data.reason);
      setRatingUpdates(data.ratings);
      setIsClockRunning(false); 
      if(user && data.ratings && data.ratings[user.id])
        {
          login({
            ...user, 
            rating: data.ratings[user.id].newRating });
        } 
    };

    const handleOpponentLeft = () => {
      if (winnerRef.current) return;
      setState(prev => ({ ...prev, winner: myRole }));
      setWinReason("forfeit");
      setIsClockRunning(false); 
    };

    // 1. Initial Clock Sync
    const handleSyncClocks = (data) => {
      setClocks({ p1: data.p1Time, p2: data.p2Time });
      setLastSyncTime(Date.now());
      setIsClockRunning(true);
    };

    // 2. Opponent Move & Clock Correction
    const handleOpponentAction = (data) => {
      const { action, p1Time, p2Time } = data;
      
      if (p1Time !== undefined) {
        setClocks({ p1: p1Time, p2: p2Time });
        setLastSyncTime(Date.now());
      }

      if (action.type === "PAWN_MOVE") executeMove(action.r, action.c, true);
      else if (action.type === "WALL_PLACE") handleWallClick(action.wallType, action.r, action.c, true);
    };

    socket.on("game_over", handleGameOver);
    socket.on("opponent_left", handleOpponentLeft);
    socket.on("sync_clocks", handleSyncClocks);     
    socket.on("sync_action", handleOpponentAction); 

    return () => {
      socket.off("game_over", handleGameOver);
      socket.off("opponent_left", handleOpponentLeft);
      socket.off("sync_clocks", handleSyncClocks);
      socket.off("sync_action", handleOpponentAction);
    };
  }, [socket, playerData, user, login, myRole]); // Note: executeMove and handleWallClick removed from dependencies to avoid loop

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    movesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, rightTab, state.moveHistory]);




  const handleCellClick = useCallback((r, c) => {
    if (!isMyTurn || state.winner || mode !== "move") return;
    if (state.winner || mode !== "move") return;
    const isCurrentPawn = r === cur.row && c === cur.col;
    if (isCurrentPawn) { setSelected(s => !s); return; }
    if (selected && validMoves.has(`${r},${c}`)) {
      executeMove(r, c);
    }
  }, [state, mode, cur, selected, validMoves, executeMove, isMyTurn]);

  const handleDragStart = (e) => {
    if (!isMyTurn || state.winner || mode !== "move") { e.preventDefault(); return; }
    if (state.winner || mode !== "move") { e.preventDefault(); return; }
    setSelected(true);
    draggingRef.current = true;
  };

  const handleDrop = (r, c) => {
    if (!isMyTurn) return;
    if (draggingRef.current && validMoves.has(`${r},${c}`)) {
      executeMove(r, c);
    }
    draggingRef.current = false;
  };


  const isWallPreviewBlocked = useCallback((type, r, c) => {
    if (type === "h") return !canPlaceHWall(r, c, state.hWalls, state.vWalls, state.p1, state.p2);
    return !canPlaceVWall(r, c, state.hWalls, state.vWalls, state.p1, state.p2);
  }, [state]);

  const isP1Turn = state.turn === "p1";
  const CELL = 46; 
  const GAP = 8; 

  const hWallAt = (r, c) => state.hWalls.has(`${r},${c}`);
  const vWallAt = (r, c) => state.vWalls.has(`${r},${c}`);
  const isHoveredWall = (type, r, c) => hovered && hovered.type === type && hovered.r === r && hovered.c === c;

  // Chat Functionality
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMsgs(prev => [...prev, { sender: "You", text: chatInput }]);
    if (socket) {
      socket.emit("chat_message", { roomId, message: chatInput });
    }
    setChatInput("");
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("sync_chat", (msgText) => {
      setChatMsgs(prev => [...prev, { sender: "Opponent", text: msgText }]);
    });
    return () => socket.off("sync_chat");
  }, [socket]);

  const movePairs = [];
  for (let i = 0; i < state.moveHistory.length; i += 2) {
    movePairs.push({ w: state.moveHistory[i], b: state.moveHistory[i + 1] });
  }

  const renderPlayerTag = (playerKey) => {
    const isP1 = playerKey === "p1";
    const isActive = state.turn === playerKey && !state.winner;
    const pData = state[playerKey];

    const name = playerData?.[playerKey]?.name || (isP1 ? "Player 1" : "Player 2");
    const rating = playerData?.[playerKey]?.rating || "1400";
    const isMe = playerKey === myRole;

    const msLeft = clocks[playerKey];
    const isLowTime = isTimedMode && isActive && msLeft !== null && msLeft <= 60000;

    return (
      <div className={`flex items-center justify-between w-full max-w-[480px] bg-[#1a140f] p-3 rounded-xl border ${isActive ? "border-[#d4700a] shadow-[0_0_15px_rgba(212,112,10,0.15)]" : "border-[#3d2b1f] opacity-80"} transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border-2 ${isActive ? "border-[#d4700a]" : "border-[#3d2b1f]"} overflow-hidden bg-[#2a2118] flex items-center justify-center text-xl`}>
            {isP1 ? "👱‍♂️" : "👦"}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f0d9b5]">
                {name} {isMe && <span className="text-[10px] text-[#d4700a] ml-1">(YOU)</span>}
              </span>
              <span className="text-xs text-[#a08b74]">({rating})</span>
            </div>

            <div className="flex gap-1 mt-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-[1px] transition-colors ${i < pData.walls ? "bg-[#d4700a]" : "bg-[#3d2b1f]"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {isTimedMode && (
          <div className={`font-mono text-xl font-bold bg-[#2a2118] px-3 py-1 rounded-lg border transition-colors ${
            isActive && isLowTime ? "text-red-500 border-red-500/50 animate-pulse" : 
            isActive ? "text-white border-[#3d2b1f]" : "text-[#a08b74] border-transparent"
          }`}>
            {formatTime(msLeft)}
          </div>
        )}
      </div>
    );
  };

  const winnerName = state.winner
    ? (playerData?.[state.winner]?.name || (state.winner === "p1" ? "Player 1" : "Player 2"))
    : "";

  return (
    <div className="flex w-full absolute inset-0">
      
      {/* --- COLUMN 1: CENTER BOARD AREA --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 relative overflow-y-auto min-w-0">
        
        <div className="w-full flex flex-col items-center gap-3 relative z-10 my-auto">
         {renderPlayerTag(myRole === "p1" ? "p2" : "p1")}

          {/* Mode Toolbar */}
          <div className="w-full max-w-[480px] flex justify-end">
            {!state.winner && (
              <div className="flex gap-1 bg-[#1a140f] p-1 rounded-lg border border-[#3d2b1f] shadow-sm">
                {[
                  { id: "move", label: "♟ Move" },
                  { id: "hwall", label: "═ H-Wall" },
                  { id: "vwall", label: "║ V-Wall" },
                ].map(btn => {
                  const disabled = btn.id !== "move" && cur.walls <= 0;
                  const isActive = mode === btn.id;
                  return (
                    <button 
                      key={btn.id} onClick={() => !disabled && setMode(btn.id)} 
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        isActive ? "bg-[#2a2118] text-[#d4700a] shadow-inner" : 
                        disabled ? "text-[#a08b74]/30 cursor-not-allowed" : 
                        "text-[#a08b74] hover:text-[#f0d9b5] hover:bg-[#2a2118]/50"
                      }`}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* THE BOARD */}
          <div 
           className={`relative bg-gradient-to-br from-[#4a3623] to-[#3a2210] rounded-xl p-3 shadow-[0_0_0_1px_rgba(61,43,31,0.5),0_0_0_4px_#1a140f,0_15px_40px_rgba(0,0,0,0.6)] ${myRole==="p2" ? "rotate-180" : ""}`}
            style={{ cursor: mode === "move" ? "default" : "crosshair", userSelect: "none" }}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Column coords */}
            <div style={{ display: "flex", paddingLeft: `${GAP / 2 + 2}px`, marginBottom: "2px" }}>
              {Array.from({ length: N }).map((_, c) => (
                <div key={c} className={`text-[#a08b74]/60 text-[9px] font-mono text-center tracking-widest uppercase ${myRole==="p2" ? "rotate-180" : ""}`} style={{ width: CELL, marginRight: c < N - 1 ? GAP : 0 }}>
                  {String.fromCharCode(97 + c)}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: N }).map((_, row) => (
              <div key={row}>
                {/* Cell row */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className={`w-3 text-[#a08b74]/60 text-[9px] font-mono text-right mr-1.5 flex-shrink-0 ${myRole==="p2" ? "rotate-180" : ""}`}>{N - row}</div>

                  {Array.from({ length: N }).map((_, col) => {
                    const isP1Here = state.p1.row === row && state.p1.col === col;
                    const isP2Here = state.p2.row === row && state.p2.col === col;
                    const isValid = mode === "move" && selected && validMoves.has(`${row},${col}`);
                    const isCurSelected = mode === "move" && selected && ((isP1Turn && isP1Here) || (!isP1Turn && isP2Here));
                    const isP1Goal = row === 0;
                    const isP2Goal = row === N - 1;

                    return (
                      <div key={col} style={{ display: "flex", alignItems: "center" }}>
                        <div
                          onClick={() => handleCellClick(row, col)}
                          onMouseEnter={() => mode === "move" && setHovered({ type: "cell", r: row, c: col })}
                          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                          onDrop={(e) => { e.preventDefault(); handleDrop(row, col); }}
                          className={`rounded flex items-center justify-center relative transition-all duration-200 ${
                            isCurSelected ? "bg-[#d4700a]/30 border-2 border-[#d4700a]" :
                            isValid ? "bg-green-500/20 border-2 border-green-500/60 cursor-pointer hover:bg-green-500/30" :
                            isP1Goal || isP2Goal ? "bg-[#b58863]/80 border border-white/5" :
                            "bg-[#b58863] border border-white/5"
                          }`}
                          style={{ width: CELL, height: CELL, cursor: isValid ? "pointer" : (isP1Here || isP2Here) && mode === "move" ? "grab" : "default" }}
                        >
                          {isValid && !isP1Here && !isP2Here && (
                            <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.6)] animate-pulse" />
                          )}

                          {/* Pawns (Draggable) */}
                          {(isP1Here || isP2Here) && (
                            <div 
                              draggable={(isP1Here && isP1Turn && !state.winner) || (isP2Here && !isP1Turn && !state.winner)}
                              onDragStart={handleDragStart}
                              onDragEnd={() => { draggingRef.current = false; }}
                              className={`w-[75%] h-[75%] rounded-full flex items-center justify-center flex-shrink-0 transition-shadow ${
                                isP1Here ? "bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#f0d9b5_55%,#c8973a_100%)]" : "bg-[radial-gradient(circle_at_35%_30%,#777_0%,#3a3633_55%,#0e0c0b_100%)]"
                              } ${((isP1Here && isP1Turn) || (isP2Here && !isP1Turn)) && mode === "move" ? "cursor-grab active:cursor-grabbing hover:scale-105" : ""}`}
                              style={{
                                border: `2px solid ${((isP1Here && isP1Turn) || (isP2Here && !isP1Turn)) ? "#d4700a" : "rgba(160,139,116,0.5)"}`,
                                boxShadow: ((isP1Here && isP1Turn) || (isP2Here && !isP1Turn)) ? "0 0 10px rgba(212,112,10,0.6), 0 2px 5px rgba(0,0,0,0.5)" : "0 2px 5px rgba(0,0,0,0.5)"
                              }}>
                              {((isP1Here && isP1Turn) || (isP2Here && !isP1Turn)) && (
                                <div className={`w-1.5 h-1.5 rounded-full ${isP1Here ? 'bg-white/60' : 'bg-white/30'}`} />
                              )}
                            </div>
                          )}
                        </div>

                        {/* V-Wall */}
                        {col < N - 1 && (() => {
                          const placed = vWallAt(row, col) || (row > 0 && vWallAt(row - 1, col));
                          const hovering = isHoveredWall("v", row, col) || (row > 0 && isHoveredWall("v", row - 1, col));
                          const blocked = hovering && mode === "vwall" && isWallPreviewBlocked("v", hovered.r, hovered.c);
                          const targetRow = Math.min(row, N - 2); 
                          return (
                            <div style={{ width: GAP, height: CELL, flexShrink: 0, position: "relative" }}
                              className={mode === "vwall" ? "cursor-crosshair" : "cursor-default"}
                              onMouseEnter={() => mode === "vwall" && setHovered({ type: "v", r: targetRow, c: col })}
                              onClick={() => mode === "vwall" && handleWallClick("v", targetRow, col)}
                            >
                              <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-sm transition-all duration-150 ${
                                placed ? "w-[4px] bg-[#d4700a] shadow-[0_0_6px_rgba(212,112,10,0.6)]" : 
                                hovering && mode === "vwall" ? (blocked ? "w-1 bg-red-500/80" : "w-1 bg-[#d4700a]/70") : 
                                "w-[1px] bg-white/5"
                              }`} />
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>

                {/* H-Wall */}
                {row < N - 1 && (
                  <div style={{ display: "flex", paddingLeft: "15px" }}>
                    {Array.from({ length: N }).map((_, col) => {
                      const placed = hWallAt(row, col) || (col > 0 && hWallAt(row, col - 1));
                      const hovering = isHoveredWall("h", row, col) || (col > 0 && isHoveredWall("h", row, col - 1));
                      const blocked = hovering && mode === "hwall" && isWallPreviewBlocked("h", hovered.r, hovered.c);
                      const targetCol = Math.min(col, N - 2);

                      return (
                        <div key={col} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ width: CELL, height: GAP, flexShrink: 0, position: "relative" }}
                            className={mode === "hwall" ? "cursor-crosshair" : "cursor-default"}
                            onMouseEnter={() => mode === "hwall" && setHovered({ type: "h", r: row, c: targetCol })}
                            onClick={() => mode === "hwall" && handleWallClick("h", row, targetCol)}
                          >
                            <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-sm transition-all duration-150 ${
                              placed ? "h-[4px] bg-[#d4700a] shadow-[0_0_6px_rgba(212,112,10,0.6)]" : 
                              hovering && mode === "hwall" ? (blocked ? "h-1 bg-red-500/80" : "h-1 bg-[#d4700a]/70") : 
                              "h-[1px] bg-white/5"
                            }`} />
                          </div>
                          {col < N - 1 && (
                            <div style={{ width: GAP, height: GAP, flexShrink: 0 }} className="flex items-center justify-center">
                              <div className="w-[2px] h-[2px] rounded-full bg-white/10" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

           {/* Winner Overlay */}
           {state.winner && (
             <div className={`absolute inset-0 z-20 bg-[#1a140f]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center animate-fade-in ${myRole === "p2" ? "rotate-180" : ""}`}>
               <div className="text-3xl font-extrabold text-[#d4700a] tracking-widest drop-shadow-[0_0_20px_rgba(212,112,10,0.6)] mb-6 text-center px-6">
                 {winReason === "forfeit" ? (
                   <>
                     <div className="text-red-500 text-sm mb-2 uppercase tracking-tighter">Opponent Left the Match</div>
                     🏆 YOU WIN BY FORFEIT!
                   </>
                 ) : winReason === "timeout" ? (
                   <>
                     <div className="text-red-500 text-sm mb-2 uppercase tracking-tighter">Opponent Ran Out Of Time</div>
                     ⏱️ YOU WIN ON TIME!
                   </>
                 ) : (
                     <>🏆 {winnerName} Wins!</>
                 )}
               </div>

               {/*Display the Elo Rating changes */}
               {ratingUpdates && playerData?.[myRole]?.id && ratingUpdates[playerData[myRole].id] &&(
                 <div className="mb-8 flex flex-col items-center bg-[#2a2118] border border-[#3d2b1f] rounded-xl p-4 shadow-lg">
                   <span className="text-[#a08b74] text-sm uppercase tracking-wider mb-1">New Rating</span>
                   <div className="flex items-center gap-3">
                     <span className="text-2xl font-bold text-[#f0d9b5]">
                       {ratingUpdates[playerData[myRole].id].newRating}
                     </span>
                     <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${ratingUpdates[playerData[myRole].id].diff >= 0
                       ? "bg-green-500/20 text-green-400"
                       : "bg-red-500/20 text-red-400"
                       }`}>
                       {ratingUpdates[playerData[myRole].id].diff >= 0 ? "+" : ""}
                       {ratingUpdates[playerData[myRole].id].diff}
                     </span>
                   </div>
                 </div>
               )}

               <button
                 onClick={() => navigate("/")}
                 className="px-10 py-4 bg-[#d4700a] hover:bg-[#f08a1c] text-white font-bold rounded-xl shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all"
               >
                 Back to home
               </button>
             </div>
           )}
          </div>

          {renderPlayerTag(myRole)}

        </div>
      </main>

      {/* --- COLUMN 2: RIGHT CHAT/INFO PANEL --- */}
      <aside className="w-80 xl:w-96 bg-[#1a140f] border-l border-[#3d2b1f] hidden lg:flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] shrink-0 h-full">
        
        {/* Tabs */}
        <div className="flex bg-[#241c15] border-b border-[#3d2b1f]">
          <button 
            onClick={() => setRightTab("chat")}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${rightTab === "chat" ? "border-[#d4700a] text-white bg-[#1a140f]" : "border-transparent text-[#a08b74] hover:text-[#f0d9b5]"}`}>
            Chat
          </button>
          <button 
            onClick={() => setRightTab("moves")}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${rightTab === "moves" ? "border-[#d4700a] text-white bg-[#1a140f]" : "border-transparent text-[#a08b74] hover:text-[#f0d9b5]"}`}>
            Moves
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#1a140f]">
          
          {/* CHAT TAB */}
          {rightTab === "chat" && (
            <div className="flex flex-col gap-3 p-4 min-h-full">
              {chatMsgs.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.sender === "System" ? "text-center text-[#a08b74] italic my-2" : "flex flex-col"}`}>
                  {msg.sender !== "System" && (
                    <span className={`font-bold text-xs mb-0.5 ${msg.sender === "You" ? "text-[#d4700a]" : "text-[#f0d9b5]"}`}>
                      {msg.sender}
                    </span>
                  )}
                  {msg.sender !== "System" ? (
                    <div className={`p-2.5 rounded-xl inline-block max-w-[85%] ${msg.sender === "You" ? "bg-[#2a2118] text-white self-start" : "bg-[#3d2b1f] text-white self-start"}`}>
                      {msg.text}
                    </div>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* MOVES TAB */}
          {rightTab === "moves" && (
            <div className="p-4 flex flex-col gap-1 min-h-full">
              {movePairs.length === 0 ? (
                <div className="text-center text-[#a08b74] italic mt-10 text-sm">Waiting for first move...</div>
              ) : (
                <table className="w-full text-sm text-left font-mono">
                  <thead>
                    <tr className="text-[#a08b74] border-b border-[#3d2b1f]">
                      <th className="py-2 w-12 font-normal">#</th>
                      <th className="py-2 w-1/2 font-normal text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white"></div> White
                      </th>
                      <th className="py-2 w-1/2 font-normal text-gray-400 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-black border border-gray-600"></div> Black
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {movePairs.map((pair, index) => (
                      <tr key={index} className={`border-b border-[#3d2b1f] ${index % 2 !== 0 ? "bg-[#241c15]" : ""}`}>
                        <td className="py-2.5 text-[#a08b74]">{index + 1}.</td>
                        <td className="py-2.5 font-bold text-white tracking-wider">{pair.w}</td>
                        <td className="py-2.5 font-bold text-[#a08b74] tracking-wider">{pair.b || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div ref={movesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input (Only shows on chat tab) */}
        {rightTab === "chat" && (
          <div className="p-4 border-t border-[#3d2b1f] bg-[#1a140f]">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a message..." 
                className="flex-1 bg-[#241c15] border border-[#3d2b1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4700a] transition-colors"
              />
              <button type="submit" className="bg-[#2a2118] hover:bg-[#3d2b1f] text-[#f0d9b5] px-3 py-2 rounded-lg font-bold transition-colors">
                ›
              </button>
            </form>
          </div>
        )}

        {/* Game Controls */}
        <div className="p-4 bg-[#241c15] border-t border-[#3d2b1f] flex gap-2">
          <button className="flex-1 bg-[#2a2118] hover:bg-[#3d2b1f] text-[#a08b74] py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
            🏳️ Resign
          </button>
          {/* <button className="flex-1 bg-[#2a2118] hover:bg-[#3d2b1f] text-[#a08b74] py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
            🤝 Draw
          </button> */}
        </div>

      </aside>

     {/* --- LEAVE CONFIRMATION MODAL --- */}
     {blocker.state === "blocked" && (
       <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
         <div className="bg-[#1a140f] border border-[#3d2b1f] p-6 rounded-xl max-w-sm w-full shadow-2xl animate-fade-in">
           <h3 className="text-xl font-bold text-[#d4700a] mb-2 flex items-center gap-2">
             ⚠️ Leave Game?
           </h3>
           <p className="text-[#a08b74] mb-6 text-sm">
             Are you sure you want to navigate away? This will immediately forfeit the match and your opponent will win.
           </p>
           <div className="flex gap-3 justify-end">
             <button
               onClick={() => blocker.reset()}
               className="px-4 py-2 bg-[#2a2118] hover:bg-[#3d2b1f] text-[#f0d9b5] font-bold rounded-lg transition-colors"
             >
               No, stay
             </button>
             <button
               onClick={() => blocker.proceed()}
               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-[0_3px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all"
             >
               Yes, forfeit
             </button>
           </div>
         </div>
       </div>
     )}
    </div>
  );
}