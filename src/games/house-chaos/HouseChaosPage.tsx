import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONTESTANTS, avatarUrl } from "../../data";
import HouseCanvas from "./HouseCanvas";
import { HouseSocket } from "./net";
import type { GameMap, GameState, HudSnap } from "./types";

const ACTIVE = CONTESTANTS.filter((c) => c.status === "active");

export default function HouseChaosPage() {
  const [picked, setPicked] = useState<(typeof ACTIVE)[0] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [map, setMap] = useState<GameMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hud, setHud] = useState<HudSnap | null>(null);
  const sock = useRef<HouseSocket | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const selfIdRef = useRef<string | null>(null);
  const hudTimer = useRef(0);

  useEffect(() => {
    return () => {
      sock.current?.close();
      document.body.classList.remove("ghar-playing");
    };
  }, []);

  useEffect(() => {
    if (playing) document.body.classList.add("ghar-playing");
    else document.body.classList.remove("ghar-playing");
  }, [playing]);

  function pushHud(s: GameState, id: string | null) {
    const me = s.players.find((p) => p.id === id);
    setHud({
      hp: me?.hp ?? 0,
      maxHp: me?.maxHp ?? 3,
      score: me?.score ?? 0,
      buff: me?.buff ?? null,
      online: s.online,
      inHouse: s.players.length,
      alive: me?.alive ?? true,
    });
  }

  function enter() {
    if (!picked) return;
    setError(null);
    setPlaying(true);
    setMap(null);
    setSelfId(null);
    setHud(null);
    stateRef.current = null;
    sock.current?.close();

    const s = new HouseSocket({
      onWelcome: (msg) => {
        selfIdRef.current = msg.id;
        setSelfId(msg.id);
        setMap(msg.map);
        stateRef.current = msg.state;
        pushHud(msg.state, msg.id);
      },
      onState: (st) => {
        stateRef.current = st;
        const now = performance.now();
        if (now - hudTimer.current > 250) {
          hudTimer.current = now;
          pushHud(st, selfIdRef.current);
        }
      },
      onError: (m) => {
        setError(m);
        setPlaying(false);
      },
      onClose: () => {},
    });
    sock.current = s;
    s.connect({
      name: picked.name.split(" ")[0],
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
    setMap(null);
    setSelfId(null);
    selfIdRef.current = null;
    setHud(null);
    stateRef.current = null;
  }

  if (playing) {
    return (
      <div className="ghar-fs">
        <div className="ghar-topbar">
          <button type="button" className="ghar-leave" onClick={leave}>
            ← Exit
          </button>
          <div className="ghar-stats">
            <strong>{picked?.name.split(" ")[0]}</strong>
            <span>
              HP {hud?.hp ?? "–"}/{hud?.maxHp ?? 3}
            </span>
            <span>Score {hud?.score ?? 0}</span>
            <span>{hud?.online ?? 0} online</span>
            {hud?.buff ? <span className="ghar-buff">{hud.buff}</span> : null}
            {hud && !hud.alive ? <span className="ghar-buff">Respawning…</span> : null}
          </div>
        </div>
        {error ? <p className="game-msg ghar-err">{error}</p> : null}
        <HouseCanvas
          map={map}
          stateRef={stateRef}
          selfId={selfId}
          onMove={onMove}
          onAttack={onAttack}
        />
      </div>
    );
  }

  return (
    <div className="game-shell house-chaos">
      <Link className="back-link" to="/games">
        ← All games
      </Link>
      <header className="game-head">
        <p className="eyebrow">Multiplayer</p>
        <h1>Ghar</h1>
        <p>
          Contestant choose karo → ghar mein ghus o. Items lo, bosses hatao,
          rivals ko hit karo.
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
            <strong>{c.name.split(" ")[0]}</strong>
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
        Play Ghar
      </button>
    </div>
  );
}
