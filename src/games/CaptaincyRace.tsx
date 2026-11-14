import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONTESTANTS, avatarUrl } from "../data";

const RACERS = CONTESTANTS.filter((c) => c.status === "active").slice(0, 6);

export default function CaptaincyRace() {
  const [pick, setPick] = useState(RACERS[0]?.handle ?? "");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const raf = useRef(0);
  const last = useRef(0);

  const pickName = useMemo(
    () => RACERS.find((r) => r.handle === pick)?.name ?? "",
    [pick]
  );

  useEffect(() => {
    return () => cancelAnimationFrame(raf.current);
  }, []);

  function start() {
    if (running) return;
    cancelAnimationFrame(raf.current);
    const zero: Record<string, number> = {};
    for (const r of RACERS) zero[r.handle] = 0;
    setProgress(zero);
    setWinner(null);
    setTaps(0);
    setRunning(true);
    last.current = performance.now();
    let alive = true;

    const tick = (t: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last.current) / 1000);
      last.current = t;
      setProgress((prev) => {
        const next = { ...prev };
        let done: string | null = null;
        for (const r of RACERS) {
          if (r.handle === pick) continue;
          const boost = 8 + Math.random() * 22;
          next[r.handle] = Math.min(100, (next[r.handle] ?? 0) + boost * dt);
          if (next[r.handle] >= 100) done = r.handle;
        }
        if (done) {
          alive = false;
          setRunning(false);
          setWinner(done);
          return next;
        }
        return next;
      });
      if (alive) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  function tap() {
    if (!running || winner) return;
    setTaps((n) => n + 1);
    setProgress((prev) => {
      const next = {
        ...prev,
        [pick]: Math.min(100, (prev[pick] ?? 0) + 4.2),
      };
      if (next[pick] >= 100) {
        cancelAnimationFrame(raf.current);
        setRunning(false);
        setWinner(pick);
      }
      return next;
    });
  }

  function reset() {
    cancelAnimationFrame(raf.current);
    setRunning(false);
    setWinner(null);
    setProgress({});
    setTaps(0);
  }

  return (
    <div className="game-shell">
      <Link className="back-link" to="/games">
        ← All games
      </Link>
      <header className="game-head">
        <p className="eyebrow">Sports · Captaincy Dash</p>
        <h1>Race to the chair</h1>
        <p>Apna housemate choose karo, phir mash mash mash — pehle 100% jeete.</p>
      </header>

      {!running && !winner ? (
        <div className="pick-row">
          {RACERS.map((r) => (
            <button
              key={r.handle}
              type="button"
              className={`pick-chip ${pick === r.handle ? "on" : ""}`}
              onClick={() => setPick(r.handle)}
            >
              <img src={avatarUrl(r.avatarId)} alt="" />
              {r.name.split(" ")[0]}
            </button>
          ))}
          <button type="button" className="stream-btn" onClick={start}>
            Start race
          </button>
        </div>
      ) : null}

      <div className="lanes">
        {RACERS.map((r) => (
          <div key={r.handle} className="lane">
            <img src={avatarUrl(r.avatarId)} alt="" />
            <div className="lane-track">
              <div
                className={`lane-fill ${r.handle === pick ? "you" : ""}`}
                style={{ width: `${progress[r.handle] ?? 0}%` }}
              />
            </div>
            <span>{Math.round(progress[r.handle] ?? 0)}%</span>
          </div>
        ))}
      </div>

      {running ? (
        <button type="button" className="mash-btn" onClick={tap}>
          TAP FOR {pickName.toUpperCase()} · {taps}
        </button>
      ) : null}

      {winner ? (
        <div className="result-banner">
          <h2>
            {winner === pick ? "Captaincy jeet gaye! 👑" : "Haar gaye…"}
          </h2>
          <p>
            Winner:{" "}
            {RACERS.find((r) => r.handle === winner)?.name ?? winner}
          </p>
          <button type="button" className="stream-btn" onClick={reset}>
            Race again
          </button>
        </div>
      ) : null}
    </div>
  );
}
