import React, { useState, useEffect, useRef } from 'react';

const BOARD_SIZE = 9;

function bfsPath(start, goalFn, walls) {
  const wallSet = new Set(walls.map(w => `${w.r},${w.c},${w.type}`));

  function isBlocked(r, c, dir) {
    if (dir === 'up')    return wallSet.has(`${r-1},${c},h`) || (c > 0 && wallSet.has(`${r-1},${c-1},h`));
    if (dir === 'down')  return wallSet.has(`${r},${c},h`)   || (c > 0 && wallSet.has(`${r},${c-1},h`));
    if (dir === 'left')  return wallSet.has(`${r},${c-1},v`) || (r > 0 && wallSet.has(`${r-1},${c-1},v`));
    if (dir === 'right') return wallSet.has(`${r},${c},v`)   || (r > 0 && wallSet.has(`${r-1},${c},v`));
    return false;
  }

  const queue = [[{ r: start.r, c: start.c }]];
  const visited = new Set([`${start.r},${start.c}`]);

  while (queue.length > 0) {
    const path = queue.shift();
    const cur = path[path.length - 1];
    if (goalFn(cur)) return path;

    for (const [nr, nc, dir] of [
      [cur.r - 1, cur.c, 'up'],
      [cur.r + 1, cur.c, 'down'],
      [cur.r, cur.c - 1, 'left'],
      [cur.r, cur.c + 1, 'right'],
    ]) {
      const key = `${nr},${nc}`;
      if (
        nr >= 0 && nr < BOARD_SIZE &&
        nc >= 0 && nc < BOARD_SIZE &&
        !visited.has(key) &&
        !isBlocked(cur.r, cur.c, dir)
      ) {
        visited.add(key);
        queue.push([...path, { r: nr, c: nc }]);
      }
    }
  }
  return null;
}

function wallsOverlap(existing, nw) {
  for (const w of existing) {
    if (w.type === nw.type && w.r === nw.r && w.c === nw.c) return true;
    if (w.type === nw.type && nw.type === 'h' && w.r === nw.r && Math.abs(w.c - nw.c) < 2) return true;
    if (w.type === nw.type && nw.type === 'v' && w.c === nw.c && Math.abs(w.r - nw.r) < 2) return true;
    if (w.type !== nw.type && w.r === nw.r && w.c === nw.c) return true;
  }
  return false;
}

function findBlockingWall(defender, defenderGoalFn, allWalls) {
  const path = bfsPath(defender, defenderGoalFn, allWalls);
  if (!path || path.length < 2) return null;

  for (let i = 1; i < Math.min(path.length, 5); i++) {
    const prev = path[i - 1];
    const cur  = path[i];
    const dr = cur.r - prev.r;
    const dc = cur.c - prev.c;

    const candidates = [];
    if (dr === 1) {
      candidates.push({ r: prev.r, c: prev.c, type: 'h' });
      if (prev.c > 0) candidates.push({ r: prev.r, c: prev.c - 1, type: 'h' });
    } else if (dr === -1) {
      candidates.push({ r: cur.r, c: cur.c, type: 'h' });
      if (cur.c > 0) candidates.push({ r: cur.r, c: cur.c - 1, type: 'h' });
    } else if (dc === 1) {
      candidates.push({ r: prev.r, c: prev.c, type: 'v' });
      if (prev.r > 0) candidates.push({ r: prev.r - 1, c: prev.c, type: 'v' });
    } else if (dc === -1) {
      candidates.push({ r: cur.r, c: cur.c, type: 'v' });
      if (cur.r > 0) candidates.push({ r: cur.r - 1, c: cur.c, type: 'v' });
    }

    for (const cand of candidates) {
      if (cand.r < 0 || cand.r > BOARD_SIZE - 2 || cand.c < 0 || cand.c > BOARD_SIZE - 2) continue;
      if (wallsOverlap(allWalls, cand)) continue;
      const testWalls = [...allWalls, cand];
      // Only place wall if defender still has a path (no trapping)
      if (bfsPath(defender, defenderGoalFn, testWalls)) return cand;
    }
  }
  return null;
}

export default function AnimatedBoard() {
  const [white, setWhite] = useState({ r: 8, c: 4 });
  const [black, setBlack] = useState({ r: 0, c: 4 });
  const [walls, setWalls] = useState([]);
  const [whiteWalls, setWhiteWalls] = useState(10);
  const [blackWalls, setBlackWalls] = useState(10);
  const [flash, setFlash] = useState(null);

  // Single ref holds ALL mutable state — defeats stale closure completely
  const S = useRef({
    white: { r: 8, c: 4 },
    black: { r: 0, c: 4 },
    walls: [],
    whiteWalls: 10,
    blackWalls: 10,
    turn: 0,
    flashing: false,
  });

  function commit(patch) {
    Object.assign(S.current, patch);
    if ('white' in patch)      setWhite({ ...patch.white });
    if ('black' in patch)      setBlack({ ...patch.black });
    if ('walls' in patch)      setWalls([...patch.walls]);
    if ('whiteWalls' in patch) setWhiteWalls(patch.whiteWalls);
    if ('blackWalls' in patch) setBlackWalls(patch.blackWalls);
  }

  function reset() {
    const s = { white: { r: 8, c: 4 }, black: { r: 0, c: 4 }, walls: [], whiteWalls: 10, blackWalls: 10, turn: 0, flashing: false };
    S.current = s;
    setWhite({ ...s.white });
    setBlack({ ...s.black });
    setWalls([]);
    setWhiteWalls(10);
    setBlackWalls(10);
  }

  useEffect(() => {
    const id = setInterval(() => {
      const s = S.current;
      if (s.flashing) return;

      // Check wins
      if (s.white.r === 0) {
        S.current.flashing = true;
        setFlash('white');
        setTimeout(() => { setFlash(null); reset(); }, 1600);
        return;
      }
      if (s.black.r === 8) {
        S.current.flashing = true;
        setFlash('black');
        setTimeout(() => { setFlash(null); reset(); }, 1600);
        return;
      }

      if (s.turn % 2 === 0) {
        // ---- WHITE'S TURN ----
        if (s.whiteWalls > 0 && Math.random() < 0.30) {
          const wall = findBlockingWall(s.black, pos => pos.r === 8, s.walls);
          if (wall) {
            commit({ walls: [...s.walls, wall], whiteWalls: s.whiteWalls - 1, turn: s.turn + 1 });
            return;
          }
        }
        const path = bfsPath(s.white, pos => pos.r === 0, s.walls);
        if (path && path.length >= 2) {
          let next = path[1];
          if (next.r === s.black.r && next.c === s.black.c) next = path[2] ?? s.white;
          commit({ white: next, turn: s.turn + 1 });
        } else {
          S.current.turn += 1;
        }
      } else {
        // ---- BLACK'S TURN ----
        if (s.blackWalls > 0 && Math.random() < 0.30) {
          const wall = findBlockingWall(s.white, pos => pos.r === 0, s.walls);
          if (wall) {
            commit({ walls: [...s.walls, wall], blackWalls: s.blackWalls - 1, turn: s.turn + 1 });
            return;
          }
        }
        const path = bfsPath(s.black, pos => pos.r === 8, s.walls);
        if (path && path.length >= 2) {
          let next = path[1];
          if (next.r === s.white.r && next.c === s.white.c) next = path[2] ?? s.black;
          commit({ black: next, turn: s.turn + 1 });
        } else {
          S.current.turn += 1;
        }
      }
    }, 750);

    return () => clearInterval(id);
  }, []); // intentionally empty — S.current always has fresh data

  const CELL = 100 / 9;

  return (
    <div
      className="w-full max-w-md aspect-square rounded-xl shadow-2xl relative overflow-hidden"
      style={{ background: '#4a3623', padding: '8px' }}
    >
      <div
        className="w-full h-full relative"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '3px' }}
      >
        {Array.from({ length: 81 }).map((_, i) => {
          const r = Math.floor(i / 9);
          return (
            <div key={i} style={{
              background:
                r === 0 ? 'rgba(240,217,181,0.45)'
                : r === 8 ? 'rgba(38,36,33,0.5)'
                : '#b58863',
              borderRadius: '2px',
            }} />
          );
        })}

        {/* White pawn */}
        <div style={{
          position: 'absolute',
          width: `${CELL}%`, height: `${CELL}%`,
          top: `${white.r * CELL}%`, left: `${white.c * CELL}%`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'top 0.55s cubic-bezier(0.34,1.4,0.64,1), left 0.55s cubic-bezier(0.34,1.4,0.64,1)',
          zIndex: 10,
        }}>
          <div style={{
            width: '70%', height: '70%', borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #fff 0%, #f0d9b5 55%, #c8973a 100%)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.55)',
            border: '1.5px solid rgba(160,110,50,0.5)',
          }} />
        </div>

        {/* Black pawn */}
        <div style={{
          position: 'absolute',
          width: `${CELL}%`, height: `${CELL}%`,
          top: `${black.r * CELL}%`, left: `${black.c * CELL}%`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'top 0.55s cubic-bezier(0.34,1.4,0.64,1), left 0.55s cubic-bezier(0.34,1.4,0.64,1)',
          zIndex: 10,
        }}>
          <div style={{
            width: '70%', height: '70%', borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #555 0%, #2a2725 55%, #0a0908 100%)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.7)',
            border: '1.5px solid rgba(90,75,55,0.4)',
          }} />
        </div>

        {/* Walls */}
        {walls.map((wall, idx) => (
          <div key={idx} style={{
            position: 'absolute',
            background: '#d4700a',
            borderRadius: '3px',
            boxShadow: '0 1px 5px rgba(0,0,0,0.45)',
            zIndex: 20,
            ...(wall.type === 'h' ? {
              top: `${(wall.r + 1) * CELL}%`,
              left: `${wall.c * CELL}%`,
              width: `${CELL * 2}%`,
              height: '5px',
              transform: 'translateY(-50%)',
            } : {
              top: `${wall.r * CELL}%`,
              left: `${(wall.c + 1) * CELL}%`,
              width: '5px',
              height: `${CELL * 2}%`,
              transform: 'translateX(-50%)',
            }),
          }} />
        ))}
      </div>

      {/* Wall counters */}
      <div style={{
        position: 'absolute', bottom: 5, left: 8, right: 8,
        display: 'flex', justifyContent: 'space-between', pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(240,217,181,0.65)', fontFamily: 'monospace' }}>◯ {whiteWalls} walls</span>
        <span style={{ fontSize: 11, color: 'rgba(240,217,181,0.65)', fontFamily: 'monospace' }}>{blackWalls} walls ●</span>
      </div>

      {/* Win overlay */}
      {flash && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', borderRadius: '12px',
        }}>
          <div style={{
            background: flash === 'white' ? '#f0d9b5' : '#1c1714',
            color:      flash === 'white' ? '#3d2b1f' : '#f0d9b5',
            padding: '10px 28px', borderRadius: '8px',
            fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 'bold', letterSpacing: 1,
          }}>
            {flash === 'white' ? '◯ White wins!' : '● Black wins!'}
          </div>
        </div>
      )}
    </div>
  );
}