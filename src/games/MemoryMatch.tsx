import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CONTESTANTS, avatarUrl } from "../data";

type Card = {
  id: string;
  handle: string;
  avatarId: string;
  name: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const pool = CONTESTANTS.filter((c) => c.status === "active").slice(0, 6);
  const pairs = pool.flatMap((c) => [
    {
      id: `${c.handle}-a`,
      handle: c.handle,
      avatarId: c.avatarId,
      name: c.name,
    },
    {
      id: `${c.handle}-b`,
      handle: c.handle,
      avatarId: c.avatarId,
      name: c.name,
    },
  ]);
  return shuffle(pairs);
}

export default function MemoryMatch() {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const done = matched.size === deck.length / 2;

  const byId = useMemo(() => {
    const m = new Map(deck.map((c) => [c.id, c]));
    return m;
  }, [deck]);

  function flip(id: string) {
    if (lock || flipped.includes(id) || matched.has(byId.get(id)!.handle))
      return;
    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }
    if (flipped.length === 1) {
      const first = flipped[0];
      const a = byId.get(first)!;
      const b = byId.get(id)!;
      const next = [first, id];
      setFlipped(next);
      setMoves((m) => m + 1);
      setLock(true);
      window.setTimeout(() => {
        if (a.handle === b.handle) {
          setMatched((prev) => new Set(prev).add(a.handle));
        }
        setFlipped([]);
        setLock(false);
      }, 650);
    }
  }

  function restart() {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLock(false);
  }

  return (
    <div className="game-shell">
      <Link className="back-link" to="/games">
        ← All games
      </Link>
      <header className="game-head">
        <p className="eyebrow">Puzzle · Face Match</p>
        <h1>Match the housemates</h1>
        <p>
          Moves: <strong>{moves}</strong>
          {done ? " · Cleared the board!" : ""}
        </p>
      </header>

      <div className="memory-grid">
        {deck.map((card) => {
          const open =
            flipped.includes(card.id) || matched.has(card.handle);
          return (
            <button
              key={card.id}
              type="button"
              className={`mem-card ${open ? "open" : ""} ${
                matched.has(card.handle) ? "matched" : ""
              }`}
              onClick={() => flip(card.id)}
              aria-label={open ? card.name : "Hidden card"}
            >
              {open ? (
                <img src={avatarUrl(card.avatarId)} alt={card.name} />
              ) : (
                <span className="mem-back">BB</span>
              )}
            </button>
          );
        })}
      </div>

      {done ? (
        <div className="result-banner">
          <h2>Puzzle clear · {moves} moves</h2>
          <button type="button" className="stream-btn" onClick={restart}>
            Shuffle again
          </button>
        </div>
      ) : (
        <button type="button" className="stream-btn ghost" onClick={restart}>
          Restart
        </button>
      )}
    </div>
  );
}
