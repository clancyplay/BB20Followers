import type { MapProp, Zone } from "./types";

const ZONE_LABEL: Record<string, string> = {
  living: "Living Room",
  kitchen: "Kitchen",
  garden: "Garden / Pool",
  confession: "Confession",
  bedroom: "Bedroom",
  secret: "Secret Room",
};

export function drawHouseBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  zones: Zone[]
) {
  // Hall floor
  ctx.fillStyle = "#241810";
  ctx.fillRect(0, 0, w, h);
  drawWoodPlanks(ctx, 0, 0, w, h, "#2a1c12", 48);

  for (const z of zones) {
    const floor = z.floor || "#2a1c12";
    ctx.fillStyle = floor;
    ctx.fillRect(z.x, z.y, z.w, z.h);

    if (z.id === "kitchen") {
      drawTileGrid(ctx, z.x, z.y, z.w, z.h, 32, "#5a4030", "#4a3220");
    } else if (z.id === "garden") {
      drawGrass(ctx, z.x, z.y, z.w, z.h);
    } else if (z.id === "living" || z.id === "bedroom") {
      drawWoodPlanks(ctx, z.x, z.y, z.w, z.h, floor, 36);
    } else if (z.id === "confession") {
      drawTileGrid(ctx, z.x, z.y, z.w, z.h, 40, "#3a2050", "#2a1840");
    } else if (z.id === "secret") {
      drawTileGrid(ctx, z.x, z.y, z.w, z.h, 28, "#5a4820", "#3a3010");
    }

    // Zone rim
    ctx.strokeStyle = z.color;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 4;
    ctx.strokeRect(z.x + 3, z.y + 3, z.w - 6, z.h - 6);
    ctx.globalAlpha = 1;

    // Label plate
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(z.x + 16, z.y + 16, 168, 30);
    ctx.fillStyle = z.color;
    ctx.font = "bold 16px Sora, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(ZONE_LABEL[z.id] || z.id, z.x + 24, z.y + 36);
  }
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: { x: number; y: number; w: number; h: number }[]
) {
  for (const w of walls) {
    // Base
    ctx.fillStyle = "#1a100c";
    ctx.fillRect(w.x, w.y, w.w, w.h);
    // Gold trim
    ctx.fillStyle = "rgba(232,197,71,0.35)";
    if (w.w > w.h) {
      ctx.fillRect(w.x, w.y, w.w, 4);
      ctx.fillRect(w.x, w.y + w.h - 4, w.w, 4);
    } else {
      ctx.fillRect(w.x, w.y, 4, w.h);
      ctx.fillRect(w.x + w.w - 4, w.y, 4, w.h);
    }
  }
}

export function drawProp(ctx: CanvasRenderingContext2D, p: MapProp) {
  const { kind, x, y, w, h } = p;
  switch (kind) {
    case "sofa":
      drawSofa(ctx, x, y, w, h);
      break;
    case "chair":
      drawChair(ctx, x, y, w, h);
      break;
    case "table":
      drawTable(ctx, x, y, w, h);
      break;
    case "bed":
      drawBed(ctx, x, y, w, h);
      break;
    case "fridge":
      drawFridge(ctx, x, y, w, h);
      break;
    case "stove":
      drawStove(ctx, x, y, w, h);
      break;
    case "sink":
      drawSink(ctx, x, y, w, h);
      break;
    case "counter":
      drawCounter(ctx, x, y, w, h);
      break;
    case "pool":
      drawPool(ctx, x, y, w, h);
      break;
    case "plant":
      drawPlant(ctx, x, y, w, h);
      break;
    case "bush":
      drawBush(ctx, x, y, w, h);
      break;
    case "tv":
      drawTv(ctx, x, y, w, h);
      break;
    case "carpet":
      drawCarpet(ctx, x, y, w, h);
      break;
    case "mess":
      drawMess(ctx, x, y, w, h);
      break;
    case "plate":
      drawPlate(ctx, x, y, w, h);
      break;
    case "bottle":
      drawBottle(ctx, x, y, w, h);
      break;
    case "lamp":
      drawLamp(ctx, x, y, w, h);
      break;
    case "crate":
      drawCrate(ctx, x, y, w, h);
      break;
    case "trash":
      drawTrash(ctx, x, y, w, h);
      break;
    case "pot":
      drawPot(ctx, x, y, w, h);
      break;
    case "lounger":
      drawLounger(ctx, x, y, w, h);
      break;
    case "umbrella":
      drawUmbrella(ctx, x, y, w, h);
      break;
    case "bench":
      drawBench(ctx, x, y, w, h);
      break;
    case "micbooth":
      drawMicBooth(ctx, x, y, w, h);
      break;
    case "camera":
      drawCamera(ctx, x, y, w, h);
      break;
    case "curtain":
      drawCurtain(ctx, x, y, w, h);
      break;
    case "wardrobe":
      drawWardrobe(ctx, x, y, w, h);
      break;
    default:
      ctx.fillStyle = "#666";
      ctx.fillRect(x, y, w, h);
  }
}

function rr(
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

function drawWoodPlanks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  step: number
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1;
  for (let yy = y; yy < y + h; yy += step) {
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
  }
}

function drawTileGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
  a: string,
  b: string
) {
  for (let yy = 0; yy < h; yy += size) {
    for (let xx = 0; xx < w; xx += size) {
      ctx.fillStyle = ((xx / size + yy / size) | 0) % 2 === 0 ? a : b;
      ctx.fillRect(x + xx, y + yy, Math.min(size, w - xx), Math.min(size, h - yy));
    }
  }
}

function drawGrass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#1a4a3a";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(46,196,182,0.25)";
  for (let i = 0; i < 40; i++) {
    const gx = x + ((i * 97) % w);
    const gy = y + ((i * 53) % h);
    ctx.fillRect(gx, gy, 8, 6);
  }
}

function drawSofa(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#6b3a2a";
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "#8b4a38";
  rr(ctx, x + 6, y + 6, w - 12, h - 14, 6);
  ctx.fill();
  // cushions
  ctx.fillStyle = "#a35a45";
  const cw = (w - 18) / 3;
  for (let i = 0; i < 3; i++) {
    rr(ctx, x + 9 + i * cw, y + 8, cw - 4, h * 0.45, 4);
    ctx.fill();
  }
}

function drawChair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#5c3a28";
  rr(ctx, x, y + h * 0.35, w, h * 0.65, 4);
  ctx.fill();
  ctx.fillStyle = "#7a5040";
  rr(ctx, x + 3, y, w - 6, h * 0.4, 3);
  ctx.fill();
}

function drawTable(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#4a3020";
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#6a4830";
  rr(ctx, x + 4, y + 4, w - 8, h - 8, 3);
  ctx.fill();
  ctx.strokeStyle = "rgba(232,197,71,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
}

function drawBed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#3a2a40";
  rr(ctx, x, y, w, h, 6);
  ctx.fill();
  // mattress
  ctx.fillStyle = "#d8c8e8";
  rr(ctx, x + 4, y + 8, w - 8, h - 16, 4);
  ctx.fill();
  // pillow
  ctx.fillStyle = "#fff0f8";
  rr(ctx, x + 8, y + 12, w - 16, 22, 4);
  ctx.fill();
  // blanket
  ctx.fillStyle = "#e63980";
  rr(ctx, x + 4, y + h * 0.4, w - 8, h * 0.5, 4);
  ctx.fill();
}

function drawFridge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#c8d0d8";
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#a0a8b0";
  ctx.fillRect(x + 4, y + h * 0.45, w - 8, 3);
  ctx.fillStyle = "#8890a0";
  ctx.fillRect(x + w - 10, y + 12, 4, 20);
  ctx.fillRect(x + w - 10, y + h * 0.55, 4, 20);
}

function drawStove(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#2a2a30";
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.arc(x + w * 0.3, y + h * 0.4, 10, 0, Math.PI * 2);
  ctx.arc(x + w * 0.7, y + h * 0.4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#888";
  ctx.fillRect(x + 8, y + h - 14, w - 16, 8);
}

function drawSink(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#5a6870";
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#8ab0c0";
  rr(ctx, x + 6, y + 8, w - 12, h - 16, 6);
  ctx.fill();
  ctx.fillStyle = "#ccc";
  ctx.fillRect(x + w / 2 - 3, y + 2, 6, 10);
}

function drawCounter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#7a5840";
  ctx.fillRect(x, y, w, Math.min(12, h));
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.strokeRect(x, y, w, h);
}

function drawPool(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#0a3a50";
  rr(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.fillStyle = "#1e90ff";
  rr(ctx, x + 8, y + 8, w - 16, h - 16, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  rr(ctx, x + 20, y + 16, w * 0.35, 14, 8);
  ctx.fill();
  ctx.strokeStyle = "#e8c547";
  ctx.lineWidth = 3;
  rr(ctx, x, y, w, h, 16);
  ctx.stroke();
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x + w * 0.25, y + h * 0.55, w * 0.5, h * 0.45);
  ctx.fillStyle = "#2ec4b6";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.35, w * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a8a7a";
  ctx.beginPath();
  ctx.arc(x + w * 0.3, y + h * 0.4, w * 0.25, 0, Math.PI * 2);
  ctx.arc(x + w * 0.7, y + h * 0.35, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#1a6a40";
  ctx.beginPath();
  ctx.arc(x + w * 0.3, y + h * 0.55, w * 0.35, 0, Math.PI * 2);
  ctx.arc(x + w * 0.7, y + h * 0.55, w * 0.35, 0, Math.PI * 2);
  ctx.arc(x + w * 0.5, y + h * 0.35, w * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function drawTv(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#1a1a20";
  rr(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.fillStyle = "#3a80c0";
  rr(ctx, x + 4, y + 3, w - 8, h - 8, 2);
  ctx.fill();
  ctx.fillStyle = "#e8c547";
  ctx.font = "bold 8px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TV", x + w / 2, y + h / 2 + 3);
}

function drawCarpet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#8b1a2a";
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = "#e8c547";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
}

function drawMess(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#5a4030";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a5a40";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.35, y + h * 0.4, w * 0.25, h * 0.25, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c45a30";
  ctx.fillRect(x + w * 0.55, y + h * 0.3, w * 0.25, h * 0.2);
}

function drawPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#e8e0d0";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#bbb";
  ctx.stroke();
}

function drawBottle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#2a6a40";
  ctx.fillRect(x, y + 4, w, h - 4);
  ctx.fillStyle = "#1a4a30";
  ctx.fillRect(x + 2, y, w - 4, 6);
}

function drawLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#3a3020";
  ctx.fillRect(x + w * 0.35, y + h * 0.4, w * 0.3, h * 0.6);
  ctx.fillStyle = "#f5d76e";
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.45);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h * 0.45);
  ctx.closePath();
  ctx.fill();
}

function drawCrate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#8b6914";
  rr(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = "#5a4010";
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.beginPath();
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
}

function drawTrash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#3a4a3a";
  rr(ctx, x, y + 4, w, h - 4, 4);
  ctx.fill();
  ctx.fillStyle = "#2a3a2a";
  ctx.fillRect(x - 2, y, w + 4, 8);
}

function drawPot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#444";
  rr(ctx, x, y + 4, w, h - 4, 4);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.fillRect(x + 4, y, w - 8, 6);
  ctx.fillStyle = "#e63946";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawLounger(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#e8c547";
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#ff6b35";
  ctx.fillRect(x + 4, y + 4, w * 0.3, h - 8);
}

function drawUmbrella(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.45, w * 0.45, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "#f7f0dd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.45);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
}

function drawBench(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#6a4a30";
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#8a6a50";
  ctx.fillRect(x + 4, y + 4, w - 8, h * 0.4);
}

function drawMicBooth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#1a1028";
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = "#7b2cbf";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#e8c547";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.35, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#aaa";
  ctx.fillRect(x + w / 2 - 3, y + h * 0.35, 6, h * 0.4);
  ctx.fillStyle = "#f5d76e";
  ctx.font = "bold 9px Sora, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MIC", x + w / 2, y + h - 10);
}

function drawCamera(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#333";
  ctx.fillRect(x + w * 0.4, y + h * 0.3, w * 0.2, h * 0.7);
  ctx.fillStyle = "#222";
  rr(ctx, x, y, w, h * 0.45, 4);
  ctx.fill();
  ctx.fillStyle = "#1e90ff";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.22, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawCurtain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#5a1a80";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 2, y + i * (h / 4), w - 4, 4);
  }
}

function drawWardrobe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#4a3028";
  rr(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = "#2a1810";
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
  ctx.fillStyle = "#e8c547";
  ctx.beginPath();
  ctx.arc(x + w * 0.35, y + h / 2, 3, 0, Math.PI * 2);
  ctx.arc(x + w * 0.65, y + h / 2, 3, 0, Math.PI * 2);
  ctx.fill();
}
