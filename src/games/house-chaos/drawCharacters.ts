import { avatarUrl } from "../../data";
import {
  bodySprite,
  enemySprite,
  pickupSprite,
} from "./sprites";

const avatarCache = new Map<string, HTMLImageElement | "loading" | "fail">();

export function preloadAvatar(avatarId: string) {
  if (!avatarId || avatarCache.has(avatarId)) return;
  avatarCache.set(avatarId, "loading");
  const img = new Image();
  img.decoding = "async";
  img.onload = () => avatarCache.set(avatarId, img);
  img.onerror = () => avatarCache.set(avatarId, "fail");
  img.src = avatarUrl(avatarId);
}

function getAvatar(avatarId: string): HTMLImageElement | null {
  if (!avatarId) return null;
  const v = avatarCache.get(avatarId);
  if (v instanceof HTMLImageElement) return v;
  if (v === undefined) preloadAvatar(avatarId);
  return null;
}

/** Image-based top-down body + DP face. */
export function drawPlayerCharacter(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    avatarId: string;
    isSelf: boolean;
    bot?: boolean;
    attacking?: boolean;
    alive: boolean;
    hp: number;
    maxHp: number;
  }
) {
  const { x, y, avatarId, isSelf, bot, attacking, alive, hp, maxHp } = opts;
  ctx.save();
  ctx.globalAlpha = alive ? 1 : 0.35;

  const body = bodySprite(isSelf, bot, attacking);
  if (body) {
    ctx.drawImage(body, x - 28, y - 20, 56, 56);
  }

  const r = 13;
  const hy = y - 14;
  ctx.beginPath();
  ctx.arc(x, hy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1208";
  ctx.fill();
  ctx.lineWidth = isSelf ? 3 : 2;
  ctx.strokeStyle = isSelf ? "#fff6c8" : attacking ? "#ff6b35" : "#e8c547";
  ctx.stroke();

  const img = getAvatar(avatarId);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, hy, r - 1.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x - r + 1.5, hy - r + 1.5, (r - 1.5) * 2, (r - 1.5) * 2);
    ctx.restore();
  }

  drawHpBar(ctx, x, y - 32, hp, maxHp, 28);
  ctx.restore();
}

export function drawEnemyCharacter(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    color: string;
    kind: string;
    hp: number;
  }
) {
  const { x, y, kind, hp } = opts;
  const img = enemySprite(kind);
  if (img) {
    ctx.drawImage(img, x - 28, y - 28, 56, 56);
  }
  drawHpBar(ctx, x, y - 34, hp, 5, 26);
}

export function drawPickup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: string
) {
  const img = pickupSprite(kind);
  if (img) {
    ctx.drawImage(img, x - 18, y - 18, 36, 36);
    return;
  }
  ctx.fillStyle = "#e8c547";
  ctx.fillRect(x - 12, y - 12, 24, 24);
}

function drawHpBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hp: number,
  max: number,
  w: number
) {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = "#2ec4b6";
  ctx.fillRect(x - w / 2, y, w * Math.max(0, hp / Math.max(1, max)), 4);
}
