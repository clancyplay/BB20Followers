import { avatarUrl } from "../../data";

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

/** Top-down housemate: body + feet + DP face (no name text). */
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

  const bodyColor = attacking
    ? "#ff6b35"
    : isSelf
      ? "#e8c547"
      : bot
        ? "#7a8899"
        : "#3a90d0";
  const shirt = attacking ? "#ff8a55" : isSelf ? "#f5d76e" : bot ? "#9aabbc" : "#5ab0e8";

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feet (top-down)
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.ellipse(x - 7, y + 12, 6, 4, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + 7, y + 12, 6, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Legs / torso oval
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shirt highlight
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 10, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x - 15, y + 2, 5, 8, -0.4, 0, Math.PI * 2);
  ctx.ellipse(x + 15, y + 2, 5, 8, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Head / DP
  const r = 14;
  ctx.beginPath();
  ctx.arc(x, y - 12, r, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1208";
  ctx.fill();
  ctx.lineWidth = isSelf ? 3 : 2;
  ctx.strokeStyle = isSelf ? "#fff6c8" : attacking ? "#ff6b35" : "#e8c547";
  ctx.stroke();

  const img = getAvatar(avatarId);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y - 12, r - 1.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x - r + 1.5, y - 12 - r + 1.5, (r - 1.5) * 2, (r - 1.5) * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = "#a89878";
    ctx.beginPath();
    ctx.arc(x, y - 12, r - 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // HP above head
  drawHpBar(ctx, x, y - 30, hp, maxHp, 28);
  ctx.restore();
}

/** Top-down enemy (boss / editor) with icon face. */
export function drawEnemyCharacter(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    label?: string;
    color: string;
    kind: string;
    hp: number;
  }
) {
  const { x, y, color, kind, hp } = opts;
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = color;
  roundRect(ctx, x - 16, y - 6, 32, 28, 8);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  roundRect(ctx, x - 12, y, 24, 16, 6);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 14, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1208";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = "bold 10px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const icon =
    kind === "salman"
      ? "SK"
      : kind === "biggBoss"
        ? "BB"
        : kind === "editor"
          ? "ED"
          : "CAM";
  ctx.fillText(icon, x, y - 14);

  drawHpBar(ctx, x, y - 32, hp, 5, 26);
  ctx.restore();
}

export function drawPickup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: string
) {
  const colors: Record<string, string> = {
    maggi: "#f5d76e",
    tomato: "#e63946",
    mic: "#7b2cbf",
    luxury: "#2ec4b6",
    captain: "#e8c547",
  };
  const c = colors[kind] || "#e8c547";
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c;
  roundRect(ctx, x - 12, y - 10, 24, 22, 6);
  ctx.fill();
  ctx.strokeStyle = "#fff6c8";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#0a0810";
  ctx.font = "bold 9px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tag =
    kind === "maggi"
      ? "MG"
      : kind === "tomato"
        ? "TM"
        : kind === "mic"
          ? "MIC"
          : kind === "luxury"
            ? "LUX"
            : "CAP";
  ctx.fillText(tag, x, y + 1);
  ctx.restore();
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
