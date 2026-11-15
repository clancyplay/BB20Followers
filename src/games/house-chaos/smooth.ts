import type { GameState, NetEnemy, NetItem, NetPlayer } from "./types";

type Pos = { x: number; y: number };

type Tracked = {
  from: Pos;
  to: Pos;
  started: number;
};

const LERP_MS = 90;

export class SmoothWorld {
  private players = new Map<string, Tracked & { snap: NetPlayer }>();
  private enemies = new Map<string, Tracked & { snap: NetEnemy }>();
  private items: NetItem[] = [];
  private online = 0;
  private lastT = 0;

  push(state: GameState) {
    const now = performance.now();
    this.online = state.online;
    this.lastT = state.t;
    this.items = state.items;

    const seenP = new Set<string>();
    for (const p of state.players) {
      seenP.add(p.id);
      const prev = this.players.get(p.id);
      if (!prev) {
        this.players.set(p.id, {
          from: { x: p.x, y: p.y },
          to: { x: p.x, y: p.y },
          started: now,
          snap: p,
        });
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
    const u = Math.min(1, (now - t.started) / LERP_MS);
    const e = 1 - (1 - u) * (1 - u);
    return {
      x: t.from.x + (t.to.x - t.from.x) * e,
      y: t.from.y + (t.to.y - t.from.y) * e,
    };
  }

  view(now = performance.now()): {
    players: (NetPlayer & { drawX: number; drawY: number })[];
    enemies: (NetEnemy & { drawX: number; drawY: number })[];
    items: NetItem[];
    online: number;
  } {
    const players = [...this.players.values()].map((t) => {
      const p = this.sample(t, now);
      return { ...t.snap, drawX: p.x, drawY: p.y };
    });
    const enemies = [...this.enemies.values()].map((t) => {
      const p = this.sample(t, now);
      return { ...t.snap, drawX: p.x, drawY: p.y };
    });
    return { players, enemies, items: this.items, online: this.online };
  }

  get serverTime() {
    return this.lastT;
  }
}
