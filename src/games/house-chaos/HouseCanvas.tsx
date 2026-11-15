import {
  useEffect,
  useRef,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { drawHouseBackground, drawProp, drawWalls } from "./drawFurniture";
import type { GameMap, GameState } from "./types";

type Props = {
  map: GameMap | null;
  /** Latest state lives here — updated without React re-renders. */
  stateRef: MutableRefObject<GameState | null>;
  selfId: string | null;
  onMove: (dx: number, dy: number) => void;
  onAttack: () => void;
};

const ITEM_COLOR: Record<string, string> = {
  maggi: "#f5d76e",
  tomato: "#e63946",
  mic: "#7b2cbf",
  luxury: "#2ec4b6",
  captain: "#e8c547",
};

export default function HouseCanvas({
  map,
  stateRef,
  selfId,
  onMove,
  onAttack,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef(new Set<string>());
  const joy = useRef({ active: false, dx: 0, dy: 0, pointerId: -1 });
  const mapRef = useRef(map);
  const selfRef = useRef(selfId);
  const onMoveRef = useRef(onMove);
  const onAttackRef = useRef(onAttack);
  mapRef.current = map;
  selfRef.current = selfId;
  onMoveRef.current = onMove;
  onAttackRef.current = onAttack;

  useEffect(() => {
    function syncMove() {
      let dx = 0;
      let dy = 0;
      if (keys.current.has("w") || keys.current.has("arrowup")) dy -= 1;
      if (keys.current.has("s") || keys.current.has("arrowdown")) dy += 1;
      if (keys.current.has("a") || keys.current.has("arrowleft")) dx -= 1;
      if (keys.current.has("d") || keys.current.has("arrowright")) dx += 1;
      if (joy.current.active) {
        dx = joy.current.dx;
        dy = joy.current.dy;
      }
      onMoveRef.current(dx, dy);
    }

    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      keys.current.add(k);
      if (k === " " || k === "j") {
        e.preventDefault();
        onAttackRef.current();
      }
      syncMove();
    }
    function onKeyUp(e: KeyboardEvent) {
      keys.current.delete(e.key.toLowerCase());
      syncMove();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const id = window.setInterval(syncMove, 33);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let lastW = 0;
    let lastH = 0;
    let lastDpr = 0;

    const draw = () => {
      const s = stateRef.current;
      const m = mapRef.current;
      const me = selfRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cssW = canvas.clientWidth || 1;
      const cssH = canvas.clientHeight || 1;

      if (cssW !== lastW || cssH !== lastH || dpr !== lastDpr) {
        lastW = cssW;
        lastH = cssH;
        lastDpr = dpr;
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.fillStyle = "#0a0710";
      ctx.fillRect(0, 0, cssW, cssH);

      if (!s || !m) {
        ctx.fillStyle = "#a89878";
        ctx.font = "14px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Connecting…", cssW / 2, cssH / 2);
        raf = requestAnimationFrame(draw);
        return;
      }

      const self = s.players.find((p) => p.id === me);
      const camX = self?.x ?? m.w / 2;
      const camY = self?.y ?? m.h / 2;
      const scale = Math.min(cssW / 520, cssH / 380, 1.35);
      const ox = cssW / 2 - camX * scale;
      const oy = cssH / 2 - camY * scale;

      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);

      drawHouseBackground(ctx, m.w, m.h, m.zones);

      // Soft props first (carpets, mess), then solids
      const props = m.props || [];
      for (const p of props) {
        if (!p.solid) drawProp(ctx, p);
      }
      for (const p of props) {
        if (p.solid) drawProp(ctx, p);
      }

      drawWalls(ctx, m.walls);

      for (const it of s.items) {
        ctx.beginPath();
        ctx.fillStyle = ITEM_COLOR[it.kind] || "#e8c547";
        ctx.arc(it.x, it.y, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const e of s.enemies) {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x - 14, e.y - 14, 28, 28);
        ctx.fillStyle = "#0a0810";
        ctx.font = "bold 9px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(e.label.slice(0, 5), e.x, e.y + 3);
        drawHp(ctx, e.x, e.y - 20, e.hp, 5);
      }

      for (const p of s.players) {
        const isSelf = p.id === me;
        ctx.globalAlpha = p.alive ? 1 : 0.3;
        ctx.beginPath();
        ctx.fillStyle = p.attacking
          ? "#ff6b35"
          : isSelf
            ? "#e8c547"
            : p.bot
              ? "#8899aa"
              : "#1e90ff";
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fill();
        if (isSelf) {
          ctx.strokeStyle = "#fff6c8";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.fillStyle = "#f7f0dd";
        ctx.font = "bold 11px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.name.split(/[\s-]/)[0].slice(0, 8), p.x, p.y - 20);
        drawHp(ctx, p.x, p.y - 30, p.hp, p.maxHp);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

  function stickFromEvent(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (e.clientX - cx) / (rect.width / 2);
    let dy = (e.clientY - cy) / (rect.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    joy.current.dx = dx;
    joy.current.dy = dy;
    onMoveRef.current(dx, dy);
  }

  function onStickStart(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    joy.current.active = true;
    joy.current.pointerId = e.pointerId;
    stickFromEvent(e);
  }

  function onStickMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!joy.current.active || e.pointerId !== joy.current.pointerId) return;
    e.preventDefault();
    stickFromEvent(e);
  }

  function onStickEnd(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerId !== joy.current.pointerId && joy.current.pointerId !== -1)
      return;
    joy.current.active = false;
    joy.current.pointerId = -1;
    joy.current.dx = 0;
    joy.current.dy = 0;
    onMoveRef.current(0, 0);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="house-stage">
      <canvas ref={canvasRef} className="house-canvas" />
      <div className="house-touch" aria-hidden="false">
        <div
          className="joy-base"
          onPointerDown={onStickStart}
          onPointerMove={onStickMove}
          onPointerUp={onStickEnd}
          onPointerCancel={onStickEnd}
        >
          <span className="joy-label">MOVE</span>
        </div>
        <button
          type="button"
          className="attack-pad"
          onPointerDown={(e) => {
            e.preventDefault();
            onAttack();
          }}
        >
          HIT
        </button>
      </div>
    </div>
  );
}

function drawHp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hp: number,
  max: number
) {
  const w = 26;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(x - w / 2, y, w, 3);
  ctx.fillStyle = "#2ec4b6";
  ctx.fillRect(x - w / 2, y, w * Math.max(0, hp / Math.max(1, max)), 3);
}
