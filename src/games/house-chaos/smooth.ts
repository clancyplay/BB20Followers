import type { GameState, NetEnemy, NetItem, NetPlayer, Wall } from "./types";

type Pos = { x: number; y: number };

type Tracked = {
  from: Pos;
  to: Pos;
  started: number;
};

const REMOTE_LERP_MS = 80;
/** Local walk speed — keep in sync with server walk speed. */
export const LOCAL_SPEED = 220;
export const LOCAL_SPEED_BUFF = 290;
const PLAYER_R = 22;
const CORRECT_SOFT = 48;
const CORRECT_HARD = 140;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function hits(
  cx: number,
  cy: number,
  r: number,
  box: { x: number; y: number; w: number; h: number }
) {
  const nx = clamp(cx, box.x, box.x + box.w);
  const ny = clamp(cy, box.y, box.y + box.h);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export class SmoothWorld {
  private players = new Map<string, Tracked & { snap: NetPlayer }>();
  private enemies = new Map<string, Tracked & { snap: NetEnemy }>();
  private items: NetItem[] = [];
  private online = 0;
  private lastT = 0;

  private localId: string | null = null;
  private localPos: Pos | null = null;
  private localInput = { dx: 0, dy: 0 };
  private localAlive = true;
  private localBuff: string | null = null;
  private solids: { x: number; y: number; w: number; h: number }[] = [];
  private worldW = 3200;
  private worldH = 2200;
  private lastTick = performance.now();

  /** Camera follow state */
  camX = 0;
  camY = 0;
  private camReady = false;

  setLocalId(id: string | null) {
    this.localId = id;
  }

  setLocalInput(dx: number, dy: number) {
    const len = Math.hypot(dx, dy);
    if (len > 1.01) {
      this.localInput.dx = dx / len;
      this.localInput.dy = dy / len;
    } else {
      this.localInput.dx = dx;
      this.localInput.dy = dy;
    }
  }

  setCollision(
    worldW: number,
    worldH: number,
    walls: Wall[],
    solidProps: { x: number; y: number; w: number; h: number }[]
  ) {
    this.worldW = worldW;
    this.worldH = worldH;
    this.solids = [...walls, ...solidProps];
  }

  private blocked(x: number, y: number) {
    const r = PLAYER_R;
    if (x - r < 0 || y - r < 0 || x + r > this.worldW || y + r > this.worldH)
      return true;
    for (const s of this.solids) {
      if (hits(x, y, r, s)) return true;
    }
    return false;
  }

  private moveLocal(dt: number) {
    if (!this.localPos || !this.localAlive) return;
    if (this.localBuff === "stunned") return;
    const { dx, dy } = this.localInput;
    if (!dx && !dy) return;
    const speed =
      this.localBuff === "speed" ? LOCAL_SPEED_BUFF : LOCAL_SPEED;
    const len = Math.hypot(dx, dy) || 1;
    const mx = (dx / len) * speed * dt;
    const my = (dy / len) * speed * dt;
    let nx = this.localPos.x + mx;
    let ny = this.localPos.y + my;
    if (!this.blocked(nx, this.localPos.y)) this.localPos.x = nx;
    if (!this.blocked(this.localPos.x, ny)) this.localPos.y = ny;
    this.localPos.x = clamp(this.localPos.x, PLAYER_R, this.worldW - PLAYER_R);
    this.localPos.y = clamp(this.localPos.y, PLAYER_R, this.worldH - PLAYER_R);
  }

  push(state: GameState) {
    const now = performance.now();
    this.online = state.online;
    this.lastT = state.t;
    this.items = state.items;

    const seenP = new Set<string>();
    for (const p of state.players) {
      seenP.add(p.id);
      const isLocal = p.id === this.localId;

      if (isLocal) {
        this.localAlive = p.alive;
        this.localBuff = p.buff;
        if (!p.alive) {
          this.localPos = { x: p.x, y: p.y };
        } else if (!this.localPos) {
          this.localPos = { x: p.x, y: p.y };
        } else {
          const err = Math.hypot(this.localPos.x - p.x, this.localPos.y - p.y);
          if (err > CORRECT_HARD || !p.alive) {
            this.localPos = { x: p.x, y: p.y };
          } else if (err > CORRECT_SOFT) {
            // Soft pull toward server — avoids rubber-band while fixing drift
            this.localPos.x += (p.x - this.localPos.x) * 0.2;
            this.localPos.y += (p.y - this.localPos.y) * 0.2;
          }
        }
      }

      const prev = this.players.get(p.id);
      if (!prev) {
        this.players.set(p.id, {
          from: { x: p.x, y: p.y },
          to: { x: p.x, y: p.y },
          started: now,
          snap: p,
        });
      } else if (isLocal) {
        // Local: snap track to predicted pos — no lerp jitter
        const lx = this.localPos?.x ?? p.x;
        const ly = this.localPos?.y ?? p.y;
        prev.from = { x: lx, y: ly };
        prev.to = { x: lx, y: ly };
        prev.started = now;
        prev.snap = p;
      } else {
        const cur = this.sample(prev, now);
        prev.from = cur;
        prev.to = { x: p.x, y: p.y };
        prev.started = now;
        prev.snap = p;
      }
    }
    for (const id of [...this.players.keys()]) {
      if (!seenP.has(id)) this.players.delete(id);
    }

    const seenE = new Set<string>();
    for (const e of state.enemies) {
      seenE.add(e.id);
      const prev = this.enemies.get(e.id);
      if (!prev) {
        this.enemies.set(e.id, {
          from: { x: e.x, y: e.y },
          to: { x: e.x, y: e.y },
          started: now,
          snap: e,
        });
      } else {
        const cur = this.sample(prev, now);
        prev.from = cur;
        prev.to = { x: e.x, y: e.y };
        prev.started = now;
        prev.snap = e;
      }
    }
    for (const id of [...this.enemies.keys()]) {
      if (!seenE.has(id)) this.enemies.delete(id);
    }
  }

  private sample(t: Tracked, now: number): Pos {
    const u = Math.min(1, (now - t.started) / REMOTE_LERP_MS);
    // Linear — constant visual speed between packets
    return {
      x: t.from.x + (t.to.x - t.from.x) * u,
      y: t.from.y + (t.to.y - t.from.y) * u,
    };
  }

  view(now = performance.now()): {
    players: (NetPlayer & { drawX: number; drawY: number })[];
    enemies: (NetEnemy & { drawX: number; drawY: number })[];
    items: NetItem[];
    online: number;
    camX: number;
    camY: number;
  } {
    const dt = Math.min(0.05, (now - this.lastTick) / 1000);
    this.lastTick = now;
    this.moveLocal(dt);

    const players = [...this.players.values()].map((t) => {
      if (t.snap.id === this.localId && this.localPos) {
        return {
          ...t.snap,
          drawX: this.localPos.x,
          drawY: this.localPos.y,
        };
      }
      const p = this.sample(t, now);
      return { ...t.snap, drawX: p.x, drawY: p.y };
    });

    const enemies = [...this.enemies.values()].map((t) => {
      const p = this.sample(t, now);
      return { ...t.snap, drawX: p.x, drawY: p.y };
    });

    const self = players.find((p) => p.id === this.localId);
    const targetX = self?.drawX ?? this.worldW / 2;
    const targetY = self?.drawY ?? this.worldH / 2;
    if (!this.camReady) {
      this.camX = targetX;
      this.camY = targetY;
      this.camReady = true;
    } else {
      // Smooth camera — same feel while walking
      const k = 1 - Math.exp(-12 * dt);
      this.camX += (targetX - this.camX) * k;
      this.camY += (targetY - this.camY) * k;
    }

    return {
      players,
      enemies,
      items: this.items,
      online: this.online,
      camX: this.camX,
      camY: this.camY,
    };
  }

  get serverTime() {
    return this.lastT;
  }
}
