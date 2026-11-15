import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONTESTANTS, avatarUrl } from "../../data";
import HouseCanvas from "./HouseCanvas";
import { HouseSocket } from "./net";
import type { GameState } from "./types";

const ACTIVE = CONTESTANTS.filter((c) => c.status === "active");

export default function HouseChaosPage() {
  const [picked, setPicked] = useState<(typeof ACTIVE)[0] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sock = useRef<HouseSocket | null>(null);

  const me = useMemo(
    () => state?.players.find((p) => p.id === selfId) ?? null,
    [state, selfId]
  );

  useEffect(() => {
    return () => sock.current?.close();
  }, []);

  function enter() {
    if (!picked) return;
    setError(null);
    setPlaying(true);
    setState(null);
    setSelfId(null);
    sock.current?.close();
    const s = new HouseSocket({
      onWelcome: (msg) => {
        setSelfId(msg.id);
        setState(msg.state);
      },
      onState: setState,
      onError: (m) => {
        setError(m);
        setPlaying(false);
      },
      onClose: () => {
        /* keep last frame; user can re-enter */
      },
    });
    sock.current = s;
    s.connect({
      name: picked.name,
      handle: picked.handle,
      avatarId: picked.avatarId,
    });
  }

  const onMove = useCallback((dx: number, dy: number) => {
    sock.current?.setMove(dx, dy);
  }, []);

  const onAttack = useCallback(() => {
    sock.current?.attack();
  }, []);

  function leave() {
    sock.current?.close();
    sock.current = null;
    setPlaying(false);
    setState(null);
    setSelfId(null);
  }

  return (
    <div className="game-shell house-chaos">
      <Link className="back-link" to="/games">
        ← All games
      </Link>

      {!playing ? (
        <>
          <header className="game-head">
            <p className="eyebrow">Main game · Multiplayer</p>
            <h1>Game-Ghar · House Chaos</h1>
            <p>
              Apna contestant choose karo, ghar mein ghus o — items collect karo,
              Bigg Boss / Salman / editors ko silence karo, aur dusre players ko
              evict karo. Alone ho to bots bhar denge.
            </p>
          </header>
          {error ? <p className="game-msg">{error}</p> : null}
          <div className="vibe-grid house-pick">
            {ACTIVE.map((c) => (
              <button
                key={c.handle}
                type="button"
                className={`vibe-card ${picked?.handle === c.handle ? "selected love" : ""}`}
                onClick={() => setPicked(c)}
              >
                <img src={avatarUrl(c.avatarId)} alt="" />
                <strong>{c.name}</strong>
                <span className="handle">{c.handle}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="stream-btn"
            disabled={!picked}
            onClick={enter}
            style={{ marginTop: 16 }}
          >
            Enter Game-Ghar
          </button>
        </>
      ) : (
        <>
          <div className="house-hud">
            <div>
              <strong>{picked?.name}</strong>
              <span className="muted">
                {" "}
                · HP {me?.hp ?? "–"}/{me?.maxHp ?? 3}
                {me?.buff ? ` · ${me.buff}` : ""}
              </span>
            </div>
            <div>
              Score <strong>{me?.score ?? 0}</strong>
              <span className="muted">
                {" "}
                · Online {state?.online ?? 0}
                {state ? ` · ${state.players.length} in house` : ""}
              </span>
            </div>
            <button type="button" className="pill ghost" onClick={leave}>
              Leave
            </button>
          </div>
          {error ? <p className="game-msg">{error}</p> : null}
          <HouseCanvas
            state={state}
            selfId={selfId}
            onMove={onMove}
            onAttack={onAttack}
          />
          <p className="house-help">
            Move: WASD / arrows · Attack: Space or J · Mobile: stick + Evict
          </p>
        </>
      )}
    </div>
  );
}
