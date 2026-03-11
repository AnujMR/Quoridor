import { useState, useRef } from "react";

// Quoridor Frontend with Drag & Drop + Valid Move Dots
// Vite + React + Tailwind

const BOARD_SIZE = 9;

function createInitialState() {
  return {
    p1: { row: 0, col: 4 },
    p2: { row: 8, col: 4 },
    turn: "p1",
  };
}

export default function QuoridorBoard() {
  const [state, setState] = useState(createInitialState());
  const draggingRef = useRef(null);
  const [, forceUpdate] = useState(0);

  const isAdjacent = (r1, c1, r2, c2) => {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return dr + dc === 1;
  };

  const inBounds = (r, c) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

  const getCurrentAndOpponent = () => {
    const { p1, p2, turn } = state;
    const current = turn === "p1" ? p1 : p2;
    const opponent = turn === "p1" ? p2 : p1;
    return { current, opponent };
  };

  // Compute valid adjacent moves (no walls/jumps yet)
  const validMoves = (() => {
    if (!state.dragging) return new Set();

    const { current, opponent } = getCurrentAndOpponent();

    const candidates = [
      [current.row - 1, current.col],
      [current.row + 1, current.col],
      [current.row, current.col - 1],
      [current.row, current.col + 1],
    ];

    const set = new Set();
    for (const [r, c] of candidates) {
      if (!inBounds(r, c)) continue;
      if (r === opponent.row && c === opponent.col) continue;
      set.add(`${r}-${c}`);
    }
    return set;
  })();

  const tryMove = (row, col) => {
    const { current, opponent } = getCurrentAndOpponent();

    // Only allow adjacent move
    if (!isAdjacent(current.row, current.col, row, col)) return;

    // Can't move onto opponent
    if (row === opponent.row && col === opponent.col) return;

    const newState = { ...state };
    newState[state.turn] = { row, col };
    newState.turn = state.turn === "p1" ? "p2" : "p1";
    newState.dragging = null;

    setState(newState);
  };

  const handleDragStart = (player) => {
    if (player !== state.turn) return;
    draggingRef.current = player;
    forceUpdate((x) => x + 1);
  };

  const handleDrop = (row, col) => {
    if (!state.dragging) return;
    if (!validMoves.has(`${row}-${col}`)) return; // only allow valid dots
    tryMove(row, col);
  };

  const handleDragEnd = () => {
    draggingRef.current = null;
    forceUpdate((x) => x + 1);
  };

  const Pawn = ({ player }) => {
    const base =
      "w-7 h-7 rounded-full shadow-md cursor-grab active:cursor-grabbing";

    const isTurn = state.turn === player;
    const color = player === "p1" ? "bg-blue-500" : "bg-red-500";

    return (
      <div
        draggable={isTurn}
        onDragStart={() => handleDragStart(player)}
        onDragEnd={handleDragEnd}
        className={`${base} ${color}`}
      />
    );
  };

  const renderCellContent = (row, col) => {
    if (state.p1.row === row && state.p1.col === col) return <Pawn player="p1" />;
    if (state.p2.row === row && state.p2.col === col) return <Pawn player="p2" />;

    // Show valid move dot while dragging
    if (validMoves.has(`${row}-${col}`)) {
      return <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />;
    }

    return null;
  };

  const checkWinner = () => {
    if (state.p1.row === BOARD_SIZE - 1) return "Player 1 Wins!";
    if (state.p2.row === 0) return "Player 2 Wins!";
    return null;
  };

  const winner = checkWinner();

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Quoridor</h1>

      {winner && (
        <div className="text-green-600 font-semibold text-lg">{winner}</div>
      )}

      <div className="text-sm text-gray-600">
        Turn: {state.turn === "p1" ? "Player 1 (Blue)" : "Player 2 (Red)"}
      </div>

      <div className="grid grid-cols-9 gap-1 bg-gray-700 p-2 rounded-xl select-none">
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(row, col)}
              className="w-12 h-12 bg-white rounded-md flex items-center justify-center hover:bg-gray-100"
            >
              {renderCellContent(row, col)}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setState(createInitialState())}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        Reset Game
      </button>

      <div className="text-xs text-gray-500 max-w-md text-center">
        Drag a pawn to see valid move dots.
      </div>
    </div>
  );
}
