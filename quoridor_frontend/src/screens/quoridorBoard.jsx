import { useState } from "react";

const BOARD_SIZE = 9;
const CELL_SIZE = 62; // in pixels, for styling

const Cell = (props) => {
  const {
    row, col, pawnId, isValidMove,
    onDragStart, onDragOver, onDrop, onDragEnd
  } = props;

  const playerIcons = {
    p1: "../../pawn1.svg",
    p2: "../../pawn2.svg",
  };

  // Fallback colors in case the SVGs fail to load, so you can still test!
  // const playerColors = {
  //   p1: "bg-blue-600",
  //   p2: "bg-red-600",
  // };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, row, col)}
      className="bg-white flex items-center justify-center relative rounded-[5px] border border-gray-800"
      style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
    >
      {/* 1. Highlight Dot for Valid Moves */}
      {isValidMove && (
        <div className="w-3 h-3 bg-green-500 rounded-full absolute pointer-events-none" />
      )}

      {/* 2. Draggable Pawn */}
      {pawnId && (
        <div
          draggable
          onDragStart={(e) => onDragStart(e, pawnId)}
          onDragEnd={onDragEnd}
          className={`w-[70%] h-[70%] cursor-grab active:cursor-grabbing`}
          style={{
            backgroundImage: `url(${playerIcons[pawnId]})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      )}
    </div>
  );
};

const QuoridorBoard = () => {
  const [state, setState] = useState({
    p1: { row: 0, col: 4 },
    p2: { row: 8, col: 4 },
    turn: "p1",
  });

  // New state variables for drag tracking
  const [dragging, setDragging] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  // Calculate valid orthogonal moves (and handle basic jumping over the opponent)
  const getValidMoves = (player, p1, p2) => {
    const pos = player === "p1" ? p1 : p2;
    const opp = player === "p1" ? p2 : p1;
    const moves = [];

    // Directions: Up, Down, Left, Right
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    directions.forEach(([dr, dc]) => {
      let nr = pos.row + dr;
      let nc = pos.col + dc;

      // Ensure move is inside the 9x9 board
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        // If opponent is blocking, check if we can jump over them
        if (nr === opp.row && nc === opp.col) {
          nr += dr;
          nc += dc;
          // Ensure the jump landing spot is also within bounds
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            moves.push({ row: nr, col: nc });
          }
        } else {
          // Normal empty cell
          moves.push({ row: nr, col: nc });
        }
      }
    });

    return moves;
  };

  const handleDragStart = (e, pawnId) => {
    // Prevent dragging if it's not this player's turn
    if (state.turn !== pawnId) {
      e.preventDefault();
      return;
    }

    setDragging(pawnId);
    setValidMoves(getValidMoves(pawnId, state.p1, state.p2));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow elements to be "dropped" here
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    if (!dragging) return;

    // Verify the drop location is one of the valid targets
    const isValid = validMoves.some((m) => m.row === row && m.col === col);

    if (isValid) {
      setState((prev) => ({
        ...prev,
        [dragging]: { row, col },
        turn: prev.turn === "p1" ? "p2" : "p1", // Swap turn
      }));
    }

    // Clean up drag states
    setDragging(null);
    setValidMoves([]);
  };

  const handleDragEnd = () => {
    // Fired if the user drops the pawn in an invalid spot (outside the board)
    setDragging(null);
    setValidMoves([]);
  };

  const isCellValidMove = (row, col) => {
    return validMoves.some((m) => m.row === row && m.col === col);
  };

  return (
      <div
        className={`grid ${state.turn === "p1" ? "bg-blue-200" : "bg-red-200"} p-2 rounded-lg gap-1 shadow-2xl`}
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, max-content)` }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const isP1 = state.p1.row === row && state.p1.col === col;
            const isP2 = state.p2.row === row && state.p2.col === col;
            const pawnId = isP1 ? "p1" : isP2 ? "p2" : null;

            return (
              <Cell
                key={`${row}-${col}`}
                row={row}
                col={col}
                pawnId={pawnId}
                isValidMove={isCellValidMove(row, col)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            );
          })
        )}
      </div>
  );
};

export default QuoridorBoard;










// import { useState } from "react";

// // Basic Quoridor Frontend (2-player local, no walls yet)
// // Built for Vite + React + Tailwind

// const BOARD_SIZE = 9;

// function createInitialState() {
//   return {
//     p1: { row: 0, col: 4 }, // top
//     p2: { row: 8, col: 4 }, // bottom
//     turn: "p1",
//   };
// }

// export default function QuoridorBoard() {
//   const [state, setState] = useState(createInitialState());

//   const isAdjacent = (r1, c1, r2, c2) => {
//     const dr = Math.abs(r1 - r2);
//     const dc = Math.abs(c1 - c2);
//     return dr + dc === 1;
//   };

//   const movePawn = (row, col) => {
//     const { p1, p2, turn } = state;

//     const current = turn === "p1" ? p1 : p2;
//     const opponent = turn === "p1" ? p2 : p1;

//     // Only allow adjacent move
//     if (!isAdjacent(current.row, current.col, row, col)) return;

//     // Can't move onto opponent
//     if (row === opponent.row && col === opponent.col) return;

//     const newState = { ...state };
//     newState[turn] = { row, col };
//     newState.turn = turn === "p1" ? "p2" : "p1";

//     setState(newState);
//   };

//   const getCellContent = (row, col) => {
//     if (state.p1.row === row && state.p1.col === col)
//       return <div className="w-6 h-6 rounded-full bg-blue-500" />;
//     if (state.p2.row === row && state.p2.col === col)
//       return <div className="w-6 h-6 rounded-full bg-red-500" />;
//     return null;
//   };

//   const checkWinner = () => {
//     if (state.p1.row === BOARD_SIZE - 1) return "Player 1 Wins!";
//     if (state.p2.row === 0) return "Player 2 Wins!";
//     return null;
//   };

//   const winner = checkWinner();

//   return (
//     <div className="flex flex-col items-center gap-4 p-6">
//       <h1 className="text-2xl font-bold">Quoridor</h1>

//       {winner && (
//         <div className="text-green-600 font-semibold text-lg">{winner}</div>
//       )}

//       <div className="text-sm text-white-600">
//         Turn: {state.turn === "p1" ? "Player 1 (Blue)" : "Player 2 (Red)"}
//       </div>

//       <div className="grid grid-cols-9 gap-1 bg-gray-700 p-2 rounded-xl">
//         {Array.from({ length: BOARD_SIZE }).map((_, row) =>
//           Array.from({ length: BOARD_SIZE }).map((_, col) => (
//             <div
//               key={`${row}-${col}`}
//               onClick={() => movePawn(row, col)}
//               className="w-12 h-12 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100"
//             >
//               {getCellContent(row, col)}
//             </div>
//           ))
//         )}
//       </div>

//       {/* <button
//         onClick={() => setState(createInitialState())}
//         className="px-4 py-2 bg-black text-white rounded-lg"
//       >
//         Reset Game
//       </button> */}
//     </div>
//   );
// }













