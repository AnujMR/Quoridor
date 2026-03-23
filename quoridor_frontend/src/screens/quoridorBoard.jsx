// import { useState } from "react";

// const BOARD_SIZE = 9;
// const CELL_SIZE = 62; // in pixels, for styling

// const Cell = (props) => {
//   const {
//     row, col, pawnId, isValidMove,
//     onDragStart, onDragOver, onDrop, onDragEnd
//   } = props;

//   const playerIcons = {
//     p1: "../../pawn1.svg",
//     p2: "../../pawn2.svg",
//   };

//   // Fallback colors in case the SVGs fail to load, so you can still test!
//   // const playerColors = {
//   //   p1: "bg-blue-600",
//   //   p2: "bg-red-600",
//   // };

//   return (
//     <div
//       onDragOver={onDragOver}
//       onDrop={(e) => onDrop(e, row, col)}
//       className="bg-white flex items-center justify-center relative rounded-[5px] border border-gray-800"
//       style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
//     >
//       {/* 1. Highlight Dot for Valid Moves */}
//       {isValidMove && (
//         <div className="w-3 h-3 bg-green-500 rounded-full absolute pointer-events-none" />
//       )}

//       {/* 2. Draggable Pawn */}
//       {pawnId && (
//         <div
//           draggable
//           onDragStart={(e) => onDragStart(e, pawnId)}
//           onDragEnd={onDragEnd}
//           className={`w-[70%] h-[70%] cursor-grab active:cursor-grabbing`}
//           style={{
//             backgroundImage: `url(${playerIcons[pawnId]})`,
//             backgroundSize: 'contain',
//             backgroundRepeat: 'no-repeat',
//             backgroundPosition: 'center'
//           }}
//         />
//       )}
//     </div>
//   );
// };

// const QuoridorBoard = () => {
//   const [state, setState] = useState({
//     p1: { row: 0, col: 4 },
//     p2: { row: 8, col: 4 },
//     turn: "p1",
//   });

//   // New state variables for drag tracking
//   const [dragging, setDragging] = useState(null);
//   const [validMoves, setValidMoves] = useState([]);

//   // Calculate valid orthogonal moves (and handle basic jumping over the opponent)
//   const getValidMoves = (player, p1, p2) => {
//     const pos = player === "p1" ? p1 : p2;
//     const opp = player === "p1" ? p2 : p1;
//     const moves = [];

//     // Directions: Up, Down, Left, Right
//     const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

//     directions.forEach(([dr, dc]) => {
//       let nr = pos.row + dr;
//       let nc = pos.col + dc;

//       // Ensure move is inside the 9x9 board
//       if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
//         // If opponent is blocking, check if we can jump over them
//         if (nr === opp.row && nc === opp.col) {
//           nr += dr;
//           nc += dc;
//           // Ensure the jump landing spot is also within bounds
//           if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
//             moves.push({ row: nr, col: nc });
//           }
//         } else {
//           // Normal empty cell
//           moves.push({ row: nr, col: nc });
//         }
//       }
//     });

//     return moves;
//   };

//   const handleDragStart = (e, pawnId) => {
//     // Prevent dragging if it's not this player's turn
//     if (state.turn !== pawnId) {
//       e.preventDefault();
//       return;
//     }

//     setDragging(pawnId);
//     setValidMoves(getValidMoves(pawnId, state.p1, state.p2));
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault(); // Necessary to allow elements to be "dropped" here
//   };

//   const handleDrop = (e, row, col) => {
//     e.preventDefault();
//     if (!dragging) return;

//     // Verify the drop location is one of the valid targets
//     const isValid = validMoves.some((m) => m.row === row && m.col === col);

//     if (isValid) {
//       setState((prev) => ({
//         ...prev,
//         [dragging]: { row, col },
//         turn: prev.turn === "p1" ? "p2" : "p1", // Swap turn
//       }));
//     }

//     // Clean up drag states
//     setDragging(null);
//     setValidMoves([]);
//   };

//   const handleDragEnd = () => {
//     // Fired if the user drops the pawn in an invalid spot (outside the board)
//     setDragging(null);
//     setValidMoves([]);
//   };

//   const isCellValidMove = (row, col) => {
//     return validMoves.some((m) => m.row === row && m.col === col);
//   };

//   return (
//       <div
//         className={`grid ${state.turn === "p1" ? "bg-blue-200" : "bg-red-200"} p-2 rounded-lg gap-1 shadow-2xl`}
//         style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, max-content)` }}
//       >
//         {Array.from({ length: BOARD_SIZE }).map((_, row) =>
//           Array.from({ length: BOARD_SIZE }).map((_, col) => {
//             const isP1 = state.p1.row === row && state.p1.col === col;
//             const isP2 = state.p2.row === row && state.p2.col === col;
//             const pawnId = isP1 ? "p1" : isP2 ? "p2" : null;

//             return (
//               <Cell
//                 key={`${row}-${col}`}
//                 row={row}
//                 col={col}
//                 pawnId={pawnId}
//                 isValidMove={isCellValidMove(row, col)}
//                 onDragStart={handleDragStart}
//                 onDragOver={handleDragOver}
//                 onDrop={handleDrop}
//                 onDragEnd={handleDragEnd}
//               />
//             );
//           })
//         )}
//       </div>
//   );
// };

// export default QuoridorBoard;










// // import { useState } from "react";

// // // Basic Quoridor Frontend (2-player local, no walls yet)
// // // Built for Vite + React + Tailwind

// // const BOARD_SIZE = 9;

// // function createInitialState() {
// //   return {
// //     p1: { row: 0, col: 4 }, // top
// //     p2: { row: 8, col: 4 }, // bottom
// //     turn: "p1",
// //   };
// // }

// // export default function QuoridorBoard() {
// //   const [state, setState] = useState(createInitialState());

// //   const isAdjacent = (r1, c1, r2, c2) => {
// //     const dr = Math.abs(r1 - r2);
// //     const dc = Math.abs(c1 - c2);
// //     return dr + dc === 1;
// //   };

// //   const movePawn = (row, col) => {
// //     const { p1, p2, turn } = state;

// //     const current = turn === "p1" ? p1 : p2;
// //     const opponent = turn === "p1" ? p2 : p1;

// //     // Only allow adjacent move
// //     if (!isAdjacent(current.row, current.col, row, col)) return;

// //     // Can't move onto opponent
// //     if (row === opponent.row && col === opponent.col) return;

// //     const newState = { ...state };
// //     newState[turn] = { row, col };
// //     newState.turn = turn === "p1" ? "p2" : "p1";

// //     setState(newState);
// //   };

// //   const getCellContent = (row, col) => {
// //     if (state.p1.row === row && state.p1.col === col)
// //       return <div className="w-6 h-6 rounded-full bg-blue-500" />;
// //     if (state.p2.row === row && state.p2.col === col)
// //       return <div className="w-6 h-6 rounded-full bg-red-500" />;
// //     return null;
// //   };

// //   const checkWinner = () => {
// //     if (state.p1.row === BOARD_SIZE - 1) return "Player 1 Wins!";
// //     if (state.p2.row === 0) return "Player 2 Wins!";
// //     return null;
// //   };

// //   const winner = checkWinner();

// //   return (
// //     <div className="flex flex-col items-center gap-4 p-6">
// //       <h1 className="text-2xl font-bold">Quoridor</h1>

// //       {winner && (
// //         <div className="text-green-600 font-semibold text-lg">{winner}</div>
// //       )}

// //       <div className="text-sm text-white-600">
// //         Turn: {state.turn === "p1" ? "Player 1 (Blue)" : "Player 2 (Red)"}
// //       </div>

// //       <div className="grid grid-cols-9 gap-1 bg-gray-700 p-2 rounded-xl">
// //         {Array.from({ length: BOARD_SIZE }).map((_, row) =>
// //           Array.from({ length: BOARD_SIZE }).map((_, col) => (
// //             <div
// //               key={`${row}-${col}`}
// //               onClick={() => movePawn(row, col)}
// //               className="w-12 h-12 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100"
// //             >
// //               {getCellContent(row, col)}
// //             </div>
// //           ))
// //         )}
// //       </div>

// //       {/* <button
// //         onClick={() => setState(createInitialState())}
// //         className="px-4 py-2 bg-black text-white rounded-lg"
// //       >
// //         Reset Game
// //       </button> */}
// //     </div>
// //   );
// // }













import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// ─── Constants & Helpers ─────────────────────────────────────────────────────
const N = 9; 

// Converts row/col to standard Quoridor notation (e.g., e4, f5h, c3v)
const coordsToNotation = (r, c, type = "") => {
  const colStr = String.fromCharCode(97 + c); // 0 -> 'a'
  const rowStr = N - r; // 8 -> 1 (Bottom row is 1)
  return `${colStr}${rowStr}${type}`;
};

// ─── BFS Pathfinding ─────────────────────────────────────────────────────────
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

// ─── Wall Validity ────────────────────────────────────────────────────────────
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

// ─── Move Validation ─────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuoridorBoard() {
  // Read URL parameters to toggle Timed Mode
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isTimedMode = queryParams.get("mode") === "timed";

  const [state, setState] = useState(initState);
  const [mode, setMode] = useState("move"); 
  const [hovered, setHovered] = useState(null); 
  const [selected, setSelected] = useState(false); 
  const [rightTab, setRightTab] = useState("chat");
  
  const draggingRef = useRef(false);
  const chatEndRef = useRef(null);
  const movesEndRef = useRef(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    { sender: "System", text: "Match started. Good luck!" }
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    movesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, rightTab, state.moveHistory]);

  const cur = state.turn === "p1" ? state.p1 : state.p2;
  const opp = state.turn === "p1" ? state.p2 : state.p1;
  const validMoves = state.winner ? new Set() : getValidMoves(cur, opp, state.hWalls, state.vWalls);

  const executeMove = useCallback((r, c) => {
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
  }, []);

  const handleCellClick = useCallback((r, c) => {
    if (state.winner || mode !== "move") return;
    const isCurrentPawn = r === cur.row && c === cur.col;
    if (isCurrentPawn) { setSelected(s => !s); return; }
    if (selected && validMoves.has(`${r},${c}`)) {
      executeMove(r, c);
    }
  }, [state, mode, cur, selected, validMoves, executeMove]);

  const handleDragStart = (e) => {
    if (state.winner || mode !== "move") { e.preventDefault(); return; }
    setSelected(true);
    draggingRef.current = true;
  };

  const handleDrop = (r, c) => {
    if (draggingRef.current && validMoves.has(`${r},${c}`)) {
      executeMove(r, c);
    }
    draggingRef.current = false;
  };

  const handleWallClick = useCallback((type, r, c) => {
    if (state.winner || cur.walls <= 0) return;
    const ok = type === "h"
      ? canPlaceHWall(r, c, state.hWalls, state.vWalls, state.p1, state.p2)
      : canPlaceVWall(r, c, state.hWalls, state.vWalls, state.p1, state.p2);
    if (!ok) return;

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
  }, [state, cur]);

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

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMsgs([...chatMsgs, { sender: "You", text: chatInput }]);
    setChatInput("");
  };

  const movePairs = [];
  for (let i = 0; i < state.moveHistory.length; i += 2) {
    movePairs.push({ w: state.moveHistory[i], b: state.moveHistory[i + 1] });
  }

  // Changed to a standard helper function (instead of a React Component) to prevent unmount bugs
  const renderPlayerTag = (playerKey) => {
    const isP1 = playerKey === "p1";
    const isActive = state.turn === playerKey && !state.winner;
    const pData = state[playerKey];
    
    return (
      <div className={`flex items-center justify-between w-full max-w-[480px] bg-[#1a140f] p-3 rounded-xl border ${isActive ? "border-[#d4700a] shadow-[0_0_15px_rgba(212,112,10,0.15)]" : "border-[#3d2b1f] opacity-80"} transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border-2 ${isActive ? "border-[#d4700a]" : "border-[#3d2b1f]"} overflow-hidden bg-[#2a2118] flex items-center justify-center text-xl`}>
             {isP1 ? "👱‍♂️" : "🤖"}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f0d9b5]">{isP1 ? "dev_69420" : "Bot_Master99"}</span>
              <span className="text-xs text-[#a08b74]">(1200)</span>
            </div>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-[1px] transition-colors ${i < pData.walls ? "bg-[#d4700a]" : "bg-[#3d2b1f]"}`} />
              ))}
            </div>
          </div>
        </div>
        {/* Dynamic checking of the mode */}
        {isTimedMode && (
          <div className={`font-mono text-xl font-bold bg-[#2a2118] px-3 py-1 rounded-lg border ${isActive ? "text-white border-[#3d2b1f]" : "text-[#a08b74] border-transparent"}`}>
            10:00
          </div>
        )}
      </div>
    );
  };

 return (
    // 👉 1. The Magic Wrapper: Replaced <> with a flex container spanning full height
    <div className="flex w-full absolute inset-0">
      
      {/* --- COLUMN 1: CENTER BOARD AREA --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 relative overflow-y-auto min-w-0">
        
        {/* We can remove the background grid here since we added it to Layout.jsx! */}

        <div className="w-full flex flex-col items-center gap-3 relative z-10 my-auto">
          {renderPlayerTag("p2")}

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
            className="relative bg-gradient-to-br from-[#4a3623] to-[#3a2210] rounded-xl p-3 shadow-[0_0_0_1px_rgba(61,43,31,0.5),0_0_0_4px_#1a140f,0_15px_40px_rgba(0,0,0,0.6)]"
            style={{ cursor: mode === "move" ? "default" : "crosshair", userSelect: "none" }}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Column coords */}
            <div style={{ display: "flex", paddingLeft: `${GAP / 2 + 2}px`, marginBottom: "2px" }}>
              {Array.from({ length: N }).map((_, c) => (
                <div key={c} className="text-[#a08b74]/60 text-[9px] font-mono text-center tracking-widest uppercase" style={{ width: CELL, marginRight: c < N - 1 ? GAP : 0 }}>
                  {String.fromCharCode(97 + c)}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: N }).map((_, row) => (
              <div key={row}>
                {/* Cell row */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="w-3 text-[#a08b74]/60 text-[9px] font-mono text-right mr-1.5 flex-shrink-0">{N - row}</div>

                  {Array.from({ length: N }).map((_, col) => {
                    const isP1Here = state.p1.row === row && state.p1.col === col;
                    const isP2Here = state.p2.row === row && state.p2.col === col;
                    const isValid = mode === "move" && selected && validMoves.has(`${row},${col}`);
                    const isCurSelected = mode === "move" && selected && ((isP1Turn && isP1Here) || (!isP1Turn && isP2Here));
                    const isP1Goal = row === 0;
                    const isP2Goal = row === N - 1;

                    return (
                      <div key={col} style={{ display: "flex", alignItems: "center" }}>
                        {/* Cell (Drop Target) */}
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
              <div className="absolute inset-0 z-20 bg-[#1a140f]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center animate-fade-in">
                <div className="text-3xl font-extrabold text-[#d4700a] tracking-widest drop-shadow-[0_0_20px_rgba(212,112,10,0.6)] mb-2">
                  🏆 {state.winner === "p1" ? "Player 1" : "Player 2"} Wins!
                </div>
                <button
                  onClick={() => { setState(initState()); setMode("move"); setSelected(false); setChatMsgs([{ sender: "System", text: "Rematch started. Good luck!" }]); }}
                  className="mt-4 px-8 py-3 bg-[#d4700a] hover:bg-[#f08a1c] text-white font-bold rounded-xl shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all"
                >
                  Rematch
                </button>
              </div>
            )}
          </div>

          {renderPlayerTag("p1")}

        </div>
      </main>

      {/* --- COLUMN 2: RIGHT CHAT/INFO PANEL --- */}
      {/* 👉 2. Added h-full here so the sidebar stretches correctly */}
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
              {/* 👉 3. Moved this outside the table to fix a hidden React console warning */}
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
          <button className="flex-1 bg-[#2a2118] hover:bg-[#3d2b1f] text-[#a08b74] py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
            🤝 Draw
          </button>
        </div>

      </aside>
    </div>
  );
}
