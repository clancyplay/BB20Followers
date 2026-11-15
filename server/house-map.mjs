/** Shared BB house layout — zones, walls, furniture props. */

export const WORLD_W = 1600;
export const WORLD_H = 1100;

export const ZONES = [
  { id: "living", x: 520, y: 320, w: 560, h: 360, color: "#c9a227", floor: "#3d2a18" },
  { id: "kitchen", x: 80, y: 80, w: 400, h: 320, color: "#ff6b35", floor: "#4a3220" },
  { id: "garden", x: 1120, y: 80, w: 400, h: 420, color: "#2ec4b6", floor: "#1a4a3a" },
  { id: "confession", x: 80, y: 480, w: 360, h: 280, color: "#7b2cbf", floor: "#2a1840" },
  { id: "bedroom", x: 1120, y: 560, w: 400, h: 320, color: "#e63980", floor: "#3a1a28" },
  { id: "secret", x: 560, y: 760, w: 480, h: 220, color: "#f5d76e", floor: "#3a3010" },
];

export const WALLS = [
  { x: 0, y: 0, w: WORLD_W, h: 24 },
  { x: 0, y: WORLD_H - 24, w: WORLD_W, h: 24 },
  { x: 0, y: 0, w: 24, h: WORLD_H },
  { x: WORLD_W - 24, y: 0, w: 24, h: WORLD_H },
  { x: 480, y: 24, w: 24, h: 260 },
  { x: 480, y: 420, w: 24, h: 200 },
  { x: 1080, y: 24, w: 24, h: 200 },
  { x: 1080, y: 400, w: 24, h: 280 },
  { x: 24, y: 440, w: 200, h: 24 },
  { x: 360, y: 440, w: 140, h: 24 },
  { x: 520, y: 700, w: 180, h: 24 },
  { x: 860, y: 700, w: 220, h: 24 },
];

/**
 * Furniture / clutter. solid=true blocks movement.
 * kind drives client drawing.
 */
export const PROPS = [
  // —— Living room ——
  { id: "sofa1", kind: "sofa", x: 620, y: 480, w: 160, h: 56, solid: true },
  { id: "sofa2", kind: "sofa", x: 820, y: 420, w: 56, h: 130, solid: true },
  { id: "chair1", kind: "chair", x: 700, y: 400, w: 36, h: 36, solid: true },
  { id: "chair2", kind: "chair", x: 760, y: 400, w: 36, h: 36, solid: true },
  { id: "coffee", kind: "table", x: 700, y: 500, w: 70, h: 48, solid: true },
  { id: "tv", kind: "tv", x: 740, y: 340, w: 110, h: 28, solid: true },
  { id: "carpet", kind: "carpet", x: 640, y: 450, w: 200, h: 140, solid: false },
  { id: "plant1", kind: "plant", x: 560, y: 360, w: 28, h: 28, solid: true },
  { id: "plant2", kind: "plant", x: 1020, y: 360, w: 28, h: 28, solid: true },
  { id: "mess1", kind: "mess", x: 900, y: 560, w: 40, h: 28, solid: false },
  { id: "bottle1", kind: "bottle", x: 720, y: 510, w: 12, h: 18, solid: false },
  { id: "plate1", kind: "plate", x: 745, y: 515, w: 18, h: 12, solid: false },
  { id: "lamp1", kind: "lamp", x: 560, y: 600, w: 22, h: 40, solid: true },

  // —— Kitchen ——
  { id: "counter1", kind: "counter", x: 100, y: 100, w: 220, h: 40, solid: true },
  { id: "counter2", kind: "counter", x: 100, y: 100, w: 40, h: 180, solid: true },
  { id: "stove", kind: "stove", x: 340, y: 100, w: 70, h: 50, solid: true },
  { id: "fridge", kind: "fridge", x: 420, y: 100, w: 48, h: 80, solid: true },
  { id: "sink", kind: "sink", x: 160, y: 100, w: 55, h: 40, solid: true },
  { id: "ktable", kind: "table", x: 220, y: 240, w: 100, h: 70, solid: true },
  { id: "kchair1", kind: "chair", x: 200, y: 250, w: 32, h: 32, solid: true },
  { id: "kchair2", kind: "chair", x: 310, y: 250, w: 32, h: 32, solid: true },
  { id: "kchair3", kind: "chair", x: 200, y: 300, w: 32, h: 32, solid: true },
  { id: "kchair4", kind: "chair", x: 310, y: 300, w: 32, h: 32, solid: true },
  { id: "mess2", kind: "mess", x: 280, y: 180, w: 50, h: 30, solid: false },
  { id: "mess3", kind: "mess", x: 140, y: 340, w: 36, h: 24, solid: false },
  { id: "pot", kind: "pot", x: 350, y: 105, w: 24, h: 20, solid: false },
  { id: "maggi_box", kind: "crate", x: 400, y: 300, w: 36, h: 28, solid: true },
  { id: "bottle2", kind: "bottle", x: 250, y: 250, w: 12, h: 18, solid: false },
  { id: "plate2", kind: "plate", x: 270, y: 255, w: 18, h: 12, solid: false },
  { id: "trash", kind: "trash", x: 440, y: 340, w: 30, h: 36, solid: true },

  // —— Garden / pool ——
  { id: "pool", kind: "pool", x: 1180, y: 180, w: 220, h: 140, solid: true },
  { id: "lounger1", kind: "lounger", x: 1200, y: 340, w: 70, h: 30, solid: true },
  { id: "lounger2", kind: "lounger", x: 1300, y: 340, w: 70, h: 30, solid: true },
  { id: "umbrella", kind: "umbrella", x: 1260, y: 360, w: 40, h: 40, solid: true },
  { id: "bush1", kind: "bush", x: 1140, y: 100, w: 40, h: 36, solid: true },
  { id: "bush2", kind: "bush", x: 1450, y: 100, w: 40, h: 36, solid: true },
  { id: "bush3", kind: "bush", x: 1140, y: 420, w: 40, h: 36, solid: true },
  { id: "plant3", kind: "plant", x: 1480, y: 280, w: 28, h: 28, solid: true },
  { id: "bench", kind: "bench", x: 1400, y: 420, w: 90, h: 32, solid: true },
  { id: "mess4", kind: "mess", x: 1220, y: 400, w: 34, h: 22, solid: false },

  // —— Confession ——
  { id: "micbooth", kind: "micbooth", x: 160, y: 540, w: 100, h: 80, solid: true },
  { id: "cchair", kind: "chair", x: 200, y: 640, w: 36, h: 36, solid: true },
  { id: "camerastand", kind: "camera", x: 320, y: 560, w: 28, h: 48, solid: true },
  { id: "spotlight", kind: "lamp", x: 100, y: 500, w: 22, h: 40, solid: true },
  { id: "curtain", kind: "curtain", x: 100, y: 500, w: 20, h: 200, solid: false },
  { id: "mess5", kind: "mess", x: 280, y: 700, w: 40, h: 26, solid: false },

  // —— Bedroom ——
  { id: "bed1", kind: "bed", x: 1160, y: 600, w: 90, h: 130, solid: true },
  { id: "bed2", kind: "bed", x: 1280, y: 600, w: 90, h: 130, solid: true },
  { id: "bed3", kind: "bed", x: 1400, y: 600, w: 90, h: 130, solid: true },
  { id: "wardrobe", kind: "wardrobe", x: 1160, y: 800, w: 100, h: 40, solid: true },
  { id: "bchair", kind: "chair", x: 1400, y: 800, w: 34, h: 34, solid: true },
  { id: "night1", kind: "crate", x: 1255, y: 610, w: 22, h: 22, solid: true },
  { id: "night2", kind: "crate", x: 1375, y: 610, w: 22, h: 22, solid: true },
  { id: "mess6", kind: "mess", x: 1320, y: 760, w: 48, h: 30, solid: false },
  { id: "clothes", kind: "mess", x: 1200, y: 760, w: 44, h: 28, solid: false },
  { id: "bottle3", kind: "bottle", x: 1260, y: 615, w: 10, h: 16, solid: false },

  // —— Secret room ——
  { id: "goldtable", kind: "table", x: 720, y: 840, w: 120, h: 70, solid: true },
  { id: "throne", kind: "sofa", x: 740, y: 920, w: 80, h: 40, solid: true },
  { id: "chest", kind: "crate", x: 600, y: 820, w: 50, h: 40, solid: true },
  { id: "chest2", kind: "crate", x: 920, y: 820, w: 50, h: 40, solid: true },
  { id: "lamp2", kind: "lamp", x: 600, y: 900, w: 22, h: 40, solid: true },
  { id: "lamp3", kind: "lamp", x: 960, y: 900, w: 22, h: 40, solid: true },
  { id: "screen", kind: "tv", x: 780, y: 790, w: 90, h: 24, solid: true },

  // —— Hallway clutter ——
  { id: "mess7", kind: "mess", x: 520, y: 280, w: 36, h: 24, solid: false },
  { id: "mess8", kind: "mess", x: 500, y: 640, w: 40, h: 28, solid: false },
  { id: "plant4", kind: "plant", x: 500, y: 500, w: 26, h: 26, solid: true },
  { id: "plant5", kind: "plant", x: 1060, y: 500, w: 26, h: 26, solid: true },
];

export const SOLID_PROPS = PROPS.filter((p) => p.solid).map((p) => ({
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
}));
