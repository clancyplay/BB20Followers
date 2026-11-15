import {
  floorSpriteForZone,
  propSprite,
  sprite,
} from "./sprites";
import type { GameMap } from "./types";

const ZONE_LABEL: Record<string, string> = {
  living: "Living Room",
  kitchen: "Kitchen",
  garden: "Garden / Pool",
  confession: "Confession",
  bedroom: "Bedroom",
  secret: "Secret Room",
};

/**
 * Bake static house (floors, props, walls) once into a canvas image.
 * Runtime frames only blit this bitmap — no per-frame shape drawing.
 */
export function bakeMapLayer(map: GameMap): HTMLCanvasElement {
  const scale = map.w > 2000 ? 0.5 : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(map.w * scale));
  canvas.height = Math.max(1, Math.floor(map.h * scale));
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.imageSmoothingEnabled = true;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Hall base
  const wood = sprite("floor_wood");
  if (wood) {
    const pat = ctx.createPattern(wood, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, map.w, map.h);
    }
  } else {
    ctx.fillStyle = "#241810";
    ctx.fillRect(0, 0, map.w, map.h);
  }

  for (const z of map.zones) {
    const floor = floorSpriteForZone(z.id);
    if (floor) {
      const pat = ctx.createPattern(floor, "repeat");
      if (pat) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(z.x, z.y, z.w, z.h);
        ctx.clip();
        ctx.fillStyle = pat;
        ctx.fillRect(z.x, z.y, z.w, z.h);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = z.floor || "#2a1c12";
      ctx.fillRect(z.x, z.y, z.w, z.h);
    }

    ctx.strokeStyle = z.color;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 6;
    ctx.strokeRect(z.x + 4, z.y + 4, z.w - 8, z.h - 8);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(z.x + 16, z.y + 16, 180, 32);
    ctx.fillStyle = z.color;
    ctx.font = "bold 18px Sora, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(ZONE_LABEL[z.id] || z.id, z.x + 24, z.y + 38);
  }

  const props = map.props || [];
  for (const p of props) {
    if (p.solid) continue;
    blitProp(ctx, p.kind, p.x, p.y, p.w, p.h);
  }
  for (const p of props) {
    if (!p.solid) continue;
    blitProp(ctx, p.kind, p.x, p.y, p.w, p.h);
  }

  for (const w of map.walls) {
    ctx.fillStyle = "#1a100c";
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = "rgba(232,197,71,0.35)";
    if (w.w > w.h) {
      ctx.fillRect(w.x, w.y, w.w, 5);
      ctx.fillRect(w.x, w.y + w.h - 5, w.w, 5);
    } else {
      ctx.fillRect(w.x, w.y, 5, w.h);
      ctx.fillRect(w.x + w.w - 5, w.y, 5, w.h);
    }
  }

  return canvas;
}

function blitProp(
  ctx: CanvasRenderingContext2D,
  kind: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const img = propSprite(kind);
  if (img) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  ctx.fillStyle = "#666";
  ctx.fillRect(x, y, w, h);
}
