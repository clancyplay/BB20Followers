import {
  useEffect,
  useRef,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { bakeMapLayer } from "./bakeMap";
import {
  drawEnemyCharacter,
  drawPickup,
  drawPlayerCharacter,
  preloadAvatar,
} from "./drawCharacters";
import type { SmoothWorld } from "./smooth";
import { loadGharSprites } from "./sprites";
import type { GameMap } from "./types";

type Props = {
  map: GameMap | null;
  worldRef: MutableRefObject<SmoothWorld>;
  selfId: string | null;
  onMove: (dx: number, dy: number) => void;
  onAttack: () => void;
};

export default function HouseCanvas({
  map,
  worldRef,
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
  const layerRef = useRef<HTMLCanvasElement | null>(null);
  const readyRef = useRef(false);
  mapRef.current = map;
  selfRef.current = selfId;
  onMoveRef.current = onMove;
  onAttackRef.current = onAttack;

  useEffect(() => {
    worldRef.current.setLocalId(selfId);
  }, [selfId, worldRef]);

  useEffect(() => {
    let cancelled = false;
    readyRef.current = false;
    layerRef.current = null;
    if (!map) return;

    const solids = (map.props || [])
      .filter((p) => p.solid)
      .map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));
    worldRef.current.setCollision(map.w, map.h, map.walls, solids);

    (async () => {
      await loadGharSprites();
      if (cancelled || !mapRef.current) return;
      layerRef.current = bakeMapLayer(mapRef.current);
      readyRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [map, worldRef]);

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
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      worldRef.current.setLocalInput(dx, dy);
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
        ctx.imageSmoothingEnabled = true;
      }

      ctx.fillStyle = "#0a0710";
      ctx.fillRect(0, 0, cssW, cssH);

      if (!m || !readyRef.current || !layerRef.current) {
        ctx.fillStyle = "#a89878";
        ctx.font = "14px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Loading Ghar…", cssW / 2, cssH / 2);
        raf = requestAnimationFrame(draw);
        return;
      }

      const view = worldRef.current.view();
      const scale = Math.min(cssW / 640, cssH / 460, 1.2);
      const ox = cssW / 2 - view.camX * scale;
      const oy = cssH / 2 - view.camY * scale;

      for (const p of view.players) {
        if (p.avatarId) preloadAvatar(p.avatarId);
      }

      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);

      // One blit for the whole static house
      ctx.drawImage(layerRef.current, 0, 0, m.w, m.h);

      for (const it of view.items) {
        drawPickup(ctx, it.x, it.y, it.kind);
      }

      for (const e of view.enemies) {
        drawEnemyCharacter(ctx, {
          x: e.drawX,
          y: e.drawY,
          color: e.color,
          kind: e.kind,
          hp: e.hp,
        });
      }

      for (const p of view.players) {
        drawPlayerCharacter(ctx, {
          x: p.drawX,
          y: p.drawY,
          avatarId: p.avatarId,
          isSelf: p.id === me,
          bot: p.bot,
          attacking: p.attacking,
          alive: p.alive,
          hp: p.hp,
          maxHp: p.maxHp,
        });
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [worldRef]);

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
      <div className="house-touch">
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
