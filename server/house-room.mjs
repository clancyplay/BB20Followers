import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import {
  WORLD_W,
  WORLD_H,
  ZONES,
  WALLS,
  PROPS,
  SOLID_PROPS,
} from "./house-map.mjs";

const TICK_MS = 50; // 20 Hz sim
const BROADCAST_MS = 50; // 20 Hz lean snapshots
const MAX_PLAYERS = 20;
const TARGET_POP = 6;
const PLAYER_R = 22;
const ENEMY_R = 24;
const ITEM_R = 18;
const ATTACK_RANGE = 55;
const ATTACK_CD = 450;
const RESPAWN_MS = 3000;
const BOT_ROSTER = [
  { name: "Arishfa", avatarId: "34e2df4c-7fe5-4fc7-9e94-6d04a5254adc" },
  { name: "Kanika", avatarId: "d4c3e6b4-185f-480d-b081-b10a84e43995" },
  { name: "Amrapali", avatarId: "80635d97-8263-4b77-a2c6-e83cf99f19f6" },
  { name: "Scout", avatarId: "4dff4fda-6782-4e5b-9b5f-62d504d3cf8d" },
  { name: "Yung", avatarId: "06ea68d9-40d7-49d2-9f90-68c027f0af45" },
  { name: "Mahhi", avatarId: "478eded1-5842-47dd-822c-1c65e96a4a58" },
  { name: "Touqeer", avatarId: "9ce14673-39bd-4298-83e4-7b4b77d159ac" },
  { name: "Gullu", avatarId: "7dd1ac26-1570-4818-a940-0f96c9ab55bc" },
  { name: "Uditi", avatarId: "fb7e0234-c523-4b0d-b2a3-9b73a2e872a3" },
  { name: "LoveGill", avatarId: "a85ca3b3-602d-4d2b-818c-d1b12c82b382" },
  { name: "Manish", avatarId: "d5fdecfb-d304-4e27-b0be-f3dc5a4d39fe" },
];

const ITEM_KINDS = [
  { kind: "maggi", buff: "heal", label: "Maggi" },
  { kind: "tomato", buff: "ranged", label: "Tomato" },
  { kind: "mic", buff: "stun", label: "Mic" },
  { kind: "luxury", buff: "speed", label: "Luxury" },
  { kind: "captain", buff: "damage", label: "Captain" },
];

const ENEMY_KINDS = [
  { kind: "biggBoss", label: "Bigg Boss", hp: 5, speed: 55, color: "#e8c547" },
  { kind: "salman", label: "Salman", hp: 4, speed: 80, color: "#1e90ff" },
  { kind: "editor", label: "Editor", hp: 3, speed: 100, color: "#e63946" },
  { kind: "camera", label: "Camera", hp: 2, speed: 70, color: "#7b2cbf" },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function circleHitsAabb(cx, cy, r, wall) {
  const nx = clamp(cx, wall.x, wall.x + wall.w);
  const ny = clamp(cy, wall.y, wall.y + wall.h);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

function blocked(x, y, r) {
  if (x - r < 0 || y - r < 0 || x + r > WORLD_W || y + r > WORLD_H) return true;
  for (const w of WALLS) {
    if (circleHitsAabb(x, y, r, w)) return true;
  }
  for (const p of SOLID_PROPS) {
    if (circleHitsAabb(x, y, r, p)) return true;
  }
  return false;
}

function resolveMove(ent, dx, dy, speed, dt, r) {
  const len = Math.hypot(dx, dy) || 1;
  const mx = (dx / len) * speed * dt;
  const my = (dy / len) * speed * dt;
  let nx = ent.x + mx;
  let ny = ent.y + my;
  if (!blocked(nx, ent.y, r)) ent.x = nx;
  if (!blocked(ent.x, ny, r)) ent.y = ny;
  ent.x = clamp(ent.x, r, WORLD_W - r);
  ent.y = clamp(ent.y, r, WORLD_H - r);
}

function randomInZone(zone) {
  return {
    x: zone.x + 40 + Math.random() * (zone.w - 80),
    y: zone.y + 40 + Math.random() * (zone.h - 80),
  };
}

function safeSpawn() {
  for (let i = 0; i < 30; i++) {
    const z = ZONES[Math.floor(Math.random() * ZONES.length)];
    const p = randomInZone(z);
    if (!blocked(p.x, p.y, PLAYER_R + 2)) return p;
  }
  return { x: WORLD_W / 2, y: WORLD_H / 2 };
}

function createRoom() {
  return {
    players: new Map(), // id -> player
    bots: new Map(),
    enemies: [],
    items: [],
    enemyKillStreak: 0,
    nextEnemyAt: 0,
    nextItemAt: 0,
    lastBroadcast: 0,
  };
}

function publicPlayer(p) {
  return {
    id: p.id,
    name: p.name,
    handle: p.handle,
    avatarId: p.avatarId,
    x: Math.round(p.x),
    y: Math.round(p.y),
    hp: p.hp,
    maxHp: p.maxHp,
    score: p.score,
    alive: p.alive,
    buff: p.buff,
    bot: !!p.bot,
    attacking: p.attackFlash > 0,
  };
}

/** Lean per-tick payload — map geometry only sent on welcome. */
function snapshot(room) {
  const players = [...room.players.values(), ...room.bots.values()].map(
    publicPlayer
  );
  return {
    type: "state",
    t: Date.now(),
    players,
    enemies: room.enemies.map((e) => ({
      id: e.id,
      kind: e.kind,
      label: e.label,
      x: Math.round(e.x),
      y: Math.round(e.y),
      hp: e.hp,
      color: e.color,
    })),
    items: room.items.map((it) => ({
      id: it.id,
      kind: it.kind,
      x: Math.round(it.x),
      y: Math.round(it.y),
    })),
    online: room.players.size,
  };
}

function spawnEnemy(room) {
  const kind = ENEMY_KINDS[Math.floor(Math.random() * ENEMY_KINDS.length)];
  const boost = Math.floor(room.enemyKillStreak / 5);
  const p = safeSpawn();
  room.enemies.push({
    id: randomUUID().slice(0, 8),
    kind: kind.kind,
    label: kind.label,
    color: kind.color,
    x: p.x,
    y: p.y,
    hp: kind.hp + boost,
    maxHp: kind.hp + boost,
    speed: kind.speed,
    hitCd: 0,
  });
}

function spawnItem(room) {
  if (room.items.length >= 12) return;
  const kind = ITEM_KINDS[Math.floor(Math.random() * ITEM_KINDS.length)];
  const p = safeSpawn();
  room.items.push({
    id: randomUUID().slice(0, 8),
    ...kind,
    x: p.x,
    y: p.y,
  });
}

function ensureBots(room) {
  const humans = room.players.size;
  const need = Math.max(0, TARGET_POP - humans - room.bots.size);
  for (let i = 0; i < need; i++) {
    const id = `bot-${randomUUID().slice(0, 6)}`;
    const roster = BOT_ROSTER[Math.floor(Math.random() * BOT_ROSTER.length)];
    const p = safeSpawn();
    room.bots.set(id, {
      id,
      bot: true,
      name: roster.name,
      handle: `@bot_${id.slice(-4)}`,
      avatarId: roster.avatarId,
      x: p.x,
      y: p.y,
      hp: 3,
      maxHp: 3,
      score: 0,
      alive: true,
      speed: 180,
      dx: 0,
      dy: 0,
      attackAt: 0,
      attackFlash: 0,
      buff: null,
      buffUntil: 0,
      respawnAt: 0,
      wanderT: 0,
      ws: null,
    });
  }
  // Trim bots if too many humans
  while (humans + room.bots.size > TARGET_POP && room.bots.size > 0) {
    const first = room.bots.keys().next().value;
    room.bots.delete(first);
  }
}

function allCombatants(room) {
  return [...room.players.values(), ...room.bots.values()].filter(
    (p) => p.alive
  );
}

function applyDamage(target, dmg, room, attacker) {
  if (!target.alive) return;
  target.hp -= dmg;
  if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
    target.respawnAt = Date.now() + RESPAWN_MS;
    if (attacker) attacker.score += target.bot || room.players.has(target.id) ? 3 : 0;
    if (attacker && (room.players.has(target.id) || room.bots.has(target.id))) {
      attacker.score += 5;
    }
  }
}

function tryAttack(attacker, room, now) {
  if (!attacker.alive) return;
  if (now < attacker.attackAt) return;
  attacker.attackAt = now + ATTACK_CD;
  attacker.attackFlash = 120;
  const dmg = attacker.buff === "damage" ? 2 : 1;
  const range =
    attacker.buff === "ranged" ? ATTACK_RANGE * 1.55 : ATTACK_RANGE;

  for (const other of allCombatants(room)) {
    if (other.id === attacker.id) continue;
    if (dist(attacker, other) <= range + PLAYER_R) {
      if (attacker.buff === "stun") {
        other.buff = "stunned";
        other.buffUntil = now + 900;
      }
      applyDamage(other, dmg, room, attacker);
    }
  }

  for (const e of room.enemies) {
    if (dist(attacker, e) <= range + ENEMY_R) {
      e.hp -= dmg;
      if (e.hp <= 0) {
        room.enemyKillStreak += 1;
        if (attacker) attacker.score += 2;
        room.enemies = room.enemies.filter((x) => x.id !== e.id);
        room.nextEnemyAt = Math.min(room.nextEnemyAt, now + 800);
      }
    }
  }
}

function tickEntityAI(ent, room, dt, now) {
  if (!ent.alive) {
    if (now >= ent.respawnAt) {
      const p = safeSpawn();
      ent.x = p.x;
      ent.y = p.y;
      ent.hp = ent.maxHp;
      ent.alive = true;
      ent.buff = null;
    }
    return;
  }
  if (ent.buff === "stunned" && now < ent.buffUntil) return;

  ent.wanderT -= dt;
  if (ent.wanderT <= 0) {
    ent.wanderT = 0.6 + Math.random() * 1.2;
    // Chase nearest enemy sometimes, else wander / chase player
    const foes = room.enemies;
    if (foes.length && Math.random() < 0.55) {
      let best = foes[0];
      let bestD = dist(ent, best);
      for (const f of foes) {
        const d = dist(ent, f);
        if (d < bestD) {
          best = f;
          bestD = d;
        }
      }
      ent.dx = best.x - ent.x;
      ent.dy = best.y - ent.y;
      if (bestD < ATTACK_RANGE + 10) tryAttack(ent, room, now);
    } else {
      const targets = allCombatants(room).filter((p) => p.id !== ent.id);
      if (targets.length && Math.random() < 0.35) {
        const t = targets[Math.floor(Math.random() * targets.length)];
        ent.dx = t.x - ent.x;
        ent.dy = t.y - ent.y;
        if (dist(ent, t) < ATTACK_RANGE + 8) tryAttack(ent, room, now);
      } else {
        ent.dx = Math.random() * 2 - 1;
        ent.dy = Math.random() * 2 - 1;
      }
    }
  }
  const speed = ent.buff === "speed" ? ent.speed * 1.35 : ent.speed;
  resolveMove(ent, ent.dx, ent.dy, speed, dt, PLAYER_R);
}

function tick(room, dt) {
  const now = Date.now();
  ensureBots(room);

  if (now >= room.nextEnemyAt) {
    if (room.enemies.length < 6 + Math.floor(room.enemyKillStreak / 8)) {
      spawnEnemy(room);
    }
    room.nextEnemyAt = now + 1800 + Math.random() * 1200;
  }
  if (now >= room.nextItemAt) {
    spawnItem(room);
    room.nextItemAt = now + 2500 + Math.random() * 2000;
  }

  // Humans
  for (const p of room.players.values()) {
    if (!p.alive) {
      if (now >= p.respawnAt) {
        const sp = safeSpawn();
        p.x = sp.x;
        p.y = sp.y;
        p.hp = p.maxHp;
        p.alive = true;
      }
      continue;
    }
    if (p.buff === "stunned" && now < p.buffUntil) {
      // frozen
    } else {
      const speed = p.buff === "speed" ? 290 : 220;
      if (p.dx || p.dy) resolveMove(p, p.dx, p.dy, speed, dt, PLAYER_R);
    }
    if (p.wantAttack) {
      p.wantAttack = false;
      tryAttack(p, room, now);
    }
    if (p.attackFlash > 0) p.attackFlash -= dt * 1000;

    // Pickups
    for (let i = room.items.length - 1; i >= 0; i--) {
      const it = room.items[i];
      if (dist(p, it) < PLAYER_R + ITEM_R) {
        if (it.buff === "heal") {
          p.hp = Math.min(p.maxHp, p.hp + 1);
        } else {
          p.buff = it.buff;
          p.buffUntil = now + 8000;
        }
        p.score += 1;
        room.items.splice(i, 1);
      }
    }
    if (p.buff && p.buff !== "stunned" && now > p.buffUntil) p.buff = null;
  }

  // Bots
  for (const b of room.bots.values()) {
    tickEntityAI(b, room, dt, now);
    if (b.attackFlash > 0) b.attackFlash -= dt * 1000;
    for (let i = room.items.length - 1; i >= 0; i--) {
      const it = room.items[i];
      if (b.alive && dist(b, it) < PLAYER_R + ITEM_R) {
        if (it.buff === "heal") b.hp = Math.min(b.maxHp, b.hp + 1);
        else {
          b.buff = it.buff;
          b.buffUntil = now + 8000;
        }
        room.items.splice(i, 1);
      }
    }
  }

  // Enemies chase nearest alive player
  const prey = allCombatants(room);
  for (const e of room.enemies) {
    e.hitCd = Math.max(0, e.hitCd - dt * 1000);
    if (!prey.length) continue;
    let best = prey[0];
    let bestD = dist(e, best);
    for (const p of prey) {
      const d = dist(e, p);
      if (d < bestD) {
        best = p;
        bestD = d;
      }
    }
    resolveMove(e, best.x - e.x, best.y - e.y, e.speed, dt, ENEMY_R);
    if (bestD < PLAYER_R + ENEMY_R + 4 && e.hitCd <= 0) {
      e.hitCd = 700;
      applyDamage(best, 1, room, null);
    }
  }
}

function send(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

export function attachHouseRoom(server) {
  const wss = new WebSocketServer({ server, path: "/ws/house" });
  const room = createRoom();
  room.nextEnemyAt = Date.now() + 500;
  room.nextItemAt = Date.now() + 800;
  spawnEnemy(room);
  spawnEnemy(room);
  spawnItem(room);

  let last = Date.now();
  setInterval(() => {
    const now = Date.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(room, dt);
    if (now - room.lastBroadcast >= BROADCAST_MS) {
      room.lastBroadcast = now;
      const snap = snapshot(room);
      for (const p of room.players.values()) {
        send(p.ws, snap);
      }
    }
  }, TICK_MS);

  wss.on("connection", (ws) => {
    let player = null;

    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }

      if (msg.type === "join") {
        if (room.players.size >= MAX_PLAYERS) {
          send(ws, { type: "error", error: "Arena full — try again soon." });
          return;
        }
        if (player) return;
        const id = randomUUID().slice(0, 8);
        const sp = safeSpawn();
        player = {
          id,
          bot: false,
          name: String(msg.name || "Housemate").slice(0, 24),
          handle: String(msg.handle || "@fan").slice(0, 40),
          avatarId: String(msg.avatarId || ""),
          x: sp.x,
          y: sp.y,
          hp: 3,
          maxHp: 3,
          score: 0,
          alive: true,
          speed: 220,
          dx: 0,
          dy: 0,
          wantAttack: false,
          attackAt: 0,
          attackFlash: 0,
          buff: null,
          buffUntil: 0,
          respawnAt: 0,
          ws,
        };
        room.players.set(id, player);
        ensureBots(room);
        send(ws, {
          type: "welcome",
          id,
          map: {
            w: WORLD_W,
            h: WORLD_H,
            zones: ZONES,
            walls: WALLS,
            props: PROPS,
          },
          state: snapshot(room),
        });
        return;
      }

      if (!player) return;

      if (msg.type === "input") {
        const dx = Number(msg.dx) || 0;
        const dy = Number(msg.dy) || 0;
        const len = Math.hypot(dx, dy);
        if (len > 1.2) {
          player.dx = dx / len;
          player.dy = dy / len;
        } else {
          player.dx = dx;
          player.dy = dy;
        }
        if (msg.attack) player.wantAttack = true;
      }
    });

    ws.on("close", () => {
      if (player) {
        room.players.delete(player.id);
        ensureBots(room);
      }
    });
  });

  return wss;
}
