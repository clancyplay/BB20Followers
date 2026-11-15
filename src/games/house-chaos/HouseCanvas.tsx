import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { GameState, Zone } from "./types";

type Props = {
  state: GameState | null;
  selfId: string | null;
  onMove: (dx: number, dy: number) => void;
  onAttack: () => void;
};

const ZONE_LABEL: Record<string, string> = {
  living: "Living Room",
  kitchen: "Kitchen",
  garden: "Garden",
  confession: "Confession",
  bedroom: "Bedroom",
  secret: "Secret Room",
};

export default function HouseCanvas({
  state,
  selfId,
  onMove,
  onAttack,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef(new Set<string>());
  const joy = useRef({ active: false, dx: 0, dy: 0 });
  const stateRef = useRef(state);
  const selfRef = useRef(selfId);
  stateRef.current = state;
  selfRef.current = selfId;

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
      onMove(dx, dy);
    }

    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      keys.current.add(k);
      if (k === " " || k === "j") {
        e.preventDefault();
        onAttack();
      }
      syncMove();
    }
    function onKeyUp(e: KeyboardEvent) {
      keys.current.delete(e.key.toLowerCase());
      syncMove();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const id = window.setInterval(syncMove, 50);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.clearInterval(id);
    };
  }, [onMove, onAttack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      const s = stateRef.current;
      const me = selfRef.current;
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (canvas.width !== Math.floor(cssW * dpr)) {
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "#0a0710";
      ctx.fillRect(0, 0, cssW, cssH);

      if (!s) {
        ctx.fillStyle = "#a89878";
        ctx.font = "14px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Connecting to Game-Ghar…", cssW / 2, cssH / 2);
        raf = requestAnimationFrame(draw);
        return;
      }

      const self = s.players.find((p) => p.id === me);
      const camX = self?.x ?? s.world.w / 2;
      const camY = self?.y ?? s.world.h / 2;
      const scale = Math.min(cssW / 700, cssH / 500, 1.15);
      const ox = cssW / 2 - camX * scale;
      const oy = cssH / 2 - camY * scale;

      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);

      // Floor
      ctx.fillStyle = "#1a1210";
      ctx.fillRect(0, 0, s.world.w, s.world.h);

      for (const z of s.zones as Zone[]) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = z.color;
        ctx.fillRect(z.x, z.y, z.w, z.h);
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = z.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(z.x + 2, z.y + 2, z.w - 4, z.h - 4);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(247,240,221,0.75)";
        ctx.font = "bold 16px Sora, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(ZONE_LABEL[z.id] || z.id, z.x + 14, z.y + 28);
      }

      ctx.fillStyle = "#3a2a18";
      for (const w of s.walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }

      // Items
      for (const it of s.items) {
        ctx.beginPath();
        ctx.fillStyle =
          it.kind === "maggi"
            ? "#f5d76e"
            : it.kind === "tomato"
              ? "#e63946"
              : it.kind === "mic"
                ? "#7b2cbf"
                : it.kind === "luxury"
                  ? "#2ec4b6"
                  : "#e8c547";
        ctx.arc(it.x, it.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0810";
        ctx.font = "10px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(it.label.slice(0, 3), it.x, it.y + 3);
      }

      // Enemies
      for (const e of s.enemies) {
        ctx.beginPath();
        ctx.fillStyle = e.color;
        ctx.strokeStyle = "#0a0810";
        ctx.lineWidth = 2;
        roundRect(ctx, e.x - 16, e.y - 16, 32, 32, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0a0810";
        ctx.font = "bold 9px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(e.label.slice(0, 6), e.x, e.y + 3);
        drawHp(ctx, e.x, e.y - 22, e.hp, 5);
      }

      // Players
      for (const p of s.players) {
        const isSelf = p.id === me;
        ctx.globalAlpha = p.alive ? 1 : 0.35;
        ctx.beginPath();
        ctx.fillStyle = isSelf ? "#e8c547" : p.bot ? "#8899aa" : "#1e90ff";
        if (p.attacking) ctx.fillStyle = "#ff6b35";
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff6c8";
        ctx.lineWidth = isSelf ? 3 : 1.5;
        ctx.stroke();
        ctx.fillStyle = "#f7f0dd";
        ctx.font = "bold 11px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.name.split(" ")[0].slice(0, 10), p.x, p.y - 22);
        if (p.buff) {
          ctx.fillStyle = "#f5d76e";
          ctx.font = "9px Sora, sans-serif";
          ctx.fillText(p.buff, p.x, p.y + 28);
        }
        drawHp(ctx, p.x, p.y - 32, p.hp, p.maxHp);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  function onStickStart(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    joy.current.active = true;
    updateStick(e);
  }
  function updateStick(e: ReactPointerEvent<HTMLDivElement>) {
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
    onMove(dx, dy);
  }
  function onStickEnd(e: ReactPointerEvent<HTMLDivElement>) {
    joy.current.active = false;
    joy.current.dx = 0;
    joy.current.dy = 0;
    onMove(0, 0);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="house-stage">
      <canvas ref={canvasRef} className="house-canvas" />
      <div className="house-touch">
        <div
          className="joy-base"
          onPointerDown={onStickStart}
          onPointerMove={(e) => joy.current.active && updateStick(e)}
          onPointerUp={onStickEnd}
          onPointerCancel={onStickEnd}
        >
          <span>MOVE</span>
        </div>
        <button type="button" className="attack-pad" onClick={onAttack}>
          EVICT
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
  const w = 28;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = "#2ec4b6";
  ctx.fillRect(x - w / 2, y, w * Math.max(0, hp / Math.max(1, max)), 4);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
