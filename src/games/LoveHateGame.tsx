import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CONTESTANTS, avatarUrl, type Contestant } from "../data";
import {
  fetchVibes,
  loadMyVibes,
  saveMyVibes,
  sendVibe,
  type MyVibes,
  type VibesPayload,
} from "./vibes";

const ACTIVE = CONTESTANTS.filter((c) => c.status === "active");

export default function LoveHateGame() {
  const [mode, setMode] = useState<"love" | "hate">("love");
  const [vibes, setVibes] = useState<VibesPayload>({ love: {}, hate: {} });
  const [mine, setMine] = useState<MyVibes>(() => loadMyVibes());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchVibes()
      .then(setVibes)
      .catch(() => setMsg("Community vibes offline — your pick still saves."));
  }, []);

  const ranked = useMemo(() => {
    const map = mode === "love" ? vibes.love : vibes.hate;
    return [...ACTIVE]
      .map((c) => ({ c, score: map[c.handle] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [mode, vibes]);

  async function pick(c: Contestant) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const next: MyVibes = { ...mine, [mode]: c.handle };
    setMine(next);
    saveMyVibes(next);
    try {
      const updated = await sendVibe(c.handle, mode);
      setVibes(updated);
      setMsg(
        mode === "love"
          ? `Pyar bhej diya → ${c.name} 💛`
          : `Hate drop → ${c.name} 🍅`
      );
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not send vibe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="game-shell">
      <Link className="back-link" to="/games">
        ← All games
      </Link>
      <header className="game-head">
        <p className="eyebrow">Social arena</p>
        <h1>Pyar vs Hate</h1>
        <p>
          Ek favourite. Ek least favourite. Community meter sabke votes se
          update hota hai.
        </p>
        <div className="mode-toggle" role="tablist">
          <button
            type="button"
            className={mode === "love" ? "on love" : "love"}
            onClick={() => setMode("love")}
          >
            💛 Give Pyar
          </button>
          <button
            type="button"
            className={mode === "hate" ? "on hate" : "hate"}
            onClick={() => setMode("hate")}
          >
            🍅 Drop Hate
          </button>
        </div>
        {msg ? <p className="game-msg">{msg}</p> : null}
      </header>

      <div className="vibe-grid">
        {ranked.map(({ c, score }, i) => {
          const selected = mine[mode] === c.handle;
          return (
            <button
              key={c.handle}
              type="button"
              className={`vibe-card ${selected ? "selected" : ""} ${mode}`}
              onClick={() => pick(c)}
              disabled={busy}
            >
              <span className="rank">#{i + 1}</span>
              <img src={avatarUrl(c.avatarId)} alt="" />
              <strong>{c.name}</strong>
              <span className="handle">{c.handle}</span>
              <span className="score">
                {mode === "love" ? "💛" : "🍅"} {score}
              </span>
              <span className="cta">
                {mode === "love" ? "Send pyar" : "Send hate"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
