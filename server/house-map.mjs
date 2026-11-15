/** Shared BB house layout — defined at 1x then doubled so rooms/items feel large. */

const S = 2;

function scaleBox(b) {
  return {
    ...b,
    x: Math.round(b.x * S),
    y: Math.round(b.y * S),
    w: Math.round(b.w * S),
    h: Math.round(b.h * S),
  };
}

export const WORLD_W = 1600 * S;
export const WORLD_H = 1100 * S;

const ZONES_1X = [
  { id: "living", x: 520, y: 320, w: 560, h: 360, color: "#c9a227", floor: "#3d2a18" },
  { id: "kitchen", x: 80, y: 80, w: 400, h: 320, color: "#ff6b35", floor: "#4a3220" },
  { id: "garden", x: 1120, y: 80, w: 400, h: 420, color: "#2ec4b6", floor: "#1a4a3a" },
  { id: "confession", x: 80, y: 480, w: 360, h: 280, color: "#7b2cbf", floor: "#2a1840" },
  { id: "bedroom", x: 1120, y: 560, w: 400, h: 320, color: "#e63980", floor: "#3a1a28" },
  { id: "secret", x: 560, y: 760, w: 480, h: 220, color: "#f5d76e", floor: "#3a3010" },
];

const WALLS_1X = [
  { x: 0, y: 0, w: 1600, h: 24 },
  { x: 0, y: 1076, w: 1600, h: 24 },
  { x: 0, y: 0, w: 24, h: 1100 },
  { x: 1576, y: 0, w: 24, h: 1100 },
  { x: 480, y: 24, w: 24, h: 260 },
  { x: 480, y: 420, w: 24, h: 200 },
  { x: 1080, y: 24, w: 24, h: 200 },
  { x: 1080, y: 400, w: 24, h: 280 },
  { x: 24, y: 440, w: 200, h: 24 },
  { x: 360, y: 440, w: 140, h: 24 },
  { x: 520, y: 700, w: 180, h: 24 },
  { x: 860, y: 700, w: 220, h: 24 },
];

const PROPS_1X = [
  // Living
  { id: "sofa1", kind: "sofa", x: 620, y: 480, w: 180, h: 64, solid: true },
  { id: "sofa2", kind: "sofa", x: 860, y: 400, w: 64, h: 150, solid: true },
  { id: "sofa3", kind: "sofa", x: 560, y: 560, w: 120, h: 50, solid: true },
  { id: "chair1", kind: "chair", x: 700, y: 390, w: 40, h: 40, solid: true },
  { id: "chair2", kind: "chair", x: 760, y: 390, w: 40, h: 40, solid: true },
  { id: "chair3", kind: "chair", x: 900, y: 560, w: 40, h: 40, solid: true },
  { id: "coffee", kind: "table", x: 700, y: 500, w: 80, h: 55, solid: true },
  { id: "sidetable", kind: "table", x: 980, y: 360, w: 50, h: 40, solid: true },
  { id: "tv", kind: "tv", x: 720, y: 340, w: 130, h: 32, solid: true },
  { id: "tvstand", kind: "counter", x: 710, y: 368, w: 150, h: 22, solid: true },
  { id: "carpet", kind: "carpet", x: 620, y: 430, w: 240, h: 160, solid: false },
  { id: "rug2", kind: "carpet", x: 900, y: 500, w: 100, h: 80, solid: false },
  { id: "plant1", kind: "plant", x: 550, y: 350, w: 34, h: 34, solid: true },
  { id: "plant2", kind: "plant", x: 1020, y: 350, w: 34, h: 34, solid: true },
  { id: "plant6", kind: "plant", x: 1000, y: 620, w: 30, h: 30, solid: true },
  { id: "lamp1", kind: "lamp", x: 550, y: 600, w: 26, h: 44, solid: true },
  { id: "lamp4", kind: "lamp", x: 1020, y: 600, w: 26, h: 44, solid: true },
  { id: "mess1", kind: "mess", x: 900, y: 580, w: 48, h: 32, solid: false },
  { id: "mess1b", kind: "mess", x: 650, y: 620, w: 40, h: 28, solid: false },
  { id: "bottle1", kind: "bottle", x: 720, y: 510, w: 14, h: 22, solid: false },
  { id: "bottle1b", kind: "bottle", x: 740, y: 512, w: 14, h: 22, solid: false },
  { id: "plate1", kind: "plate", x: 760, y: 518, w: 22, h: 14, solid: false },
  { id: "plate1b", kind: "plate", x: 790, y: 520, w: 22, h: 14, solid: false },

  // Kitchen
  { id: "counter1", kind: "counter", x: 100, y: 100, w: 240, h: 44, solid: true },
  { id: "counter2", kind: "counter", x: 100, y: 100, w: 44, h: 200, solid: true },
  { id: "counter3", kind: "counter", x: 100, y: 360, w: 160, h: 36, solid: true },
  { id: "stove", kind: "stove", x: 350, y: 100, w: 80, h: 56, solid: true },
  { id: "fridge", kind: "fridge", x: 430, y: 100, w: 52, h: 90, solid: true },
  { id: "sink", kind: "sink", x: 170, y: 100, w: 60, h: 44, solid: true },
  { id: "ktable", kind: "table", x: 220, y: 230, w: 120, h: 80, solid: true },
  { id: "kchair1", kind: "chair", x: 190, y: 240, w: 36, h: 36, solid: true },
  { id: "kchair2", kind: "chair", x: 330, y: 240, w: 36, h: 36, solid: true },
  { id: "kchair3", kind: "chair", x: 190, y: 300, w: 36, h: 36, solid: true },
  { id: "kchair4", kind: "chair", x: 330, y: 300, w: 36, h: 36, solid: true },
  { id: "shelf", kind: "wardrobe", x: 300, y: 360, w: 90, h: 36, solid: true },
  { id: "mess2", kind: "mess", x: 280, y: 180, w: 55, h: 34, solid: false },
  { id: "mess3", kind: "mess", x: 140, y: 320, w: 42, h: 28, solid: false },
  { id: "mess3b", kind: "mess", x: 380, y: 280, w: 36, h: 24, solid: false },
  { id: "pot", kind: "pot", x: 360, y: 105, w: 28, h: 24, solid: false },
  { id: "pot2", kind: "pot", x: 395, y: 108, w: 24, h: 20, solid: false },
  { id: "maggi_box", kind: "crate", x: 400, y: 300, w: 40, h: 32, solid: true },
  { id: "spice", kind: "crate", x: 120, y: 150, w: 28, h: 24, solid: true },
  { id: "bottle2", kind: "bottle", x: 250, y: 245, w: 14, h: 22, solid: false },
  { id: "bottle2b", kind: "bottle", x: 268, y: 248, w: 14, h: 20, solid: false },
  { id: "plate2", kind: "plate", x: 290, y: 255, w: 22, h: 14, solid: false },
  { id: "plate2b", kind: "plate", x: 315, y: 258, w: 22, h: 14, solid: false },
  { id: "trash", kind: "trash", x: 440, y: 340, w: 34, h: 40, solid: true },
  { id: "trash2", kind: "trash", x: 100, y: 300, w: 30, h: 36, solid: true },

  // Garden
  { id: "pool", kind: "pool", x: 1180, y: 160, w: 260, h: 160, solid: true },
  { id: "lounger1", kind: "lounger", x: 1200, y: 340, w: 80, h: 34, solid: true },
  { id: "lounger2", kind: "lounger", x: 1320, y: 340, w: 80, h: 34, solid: true },
  { id: "lounger3", kind: "lounger", x: 1200, y: 390, w: 80, h: 34, solid: true },
  { id: "umbrella", kind: "umbrella", x: 1280, y: 360, w: 48, h: 48, solid: true },
  { id: "bush1", kind: "bush", x: 1140, y: 100, w: 48, h: 42, solid: true },
  { id: "bush2", kind: "bush", x: 1450, y: 100, w: 48, h: 42, solid: true },
  { id: "bush3", kind: "bush", x: 1140, y: 430, w: 48, h: 42, solid: true },
  { id: "bush4", kind: "bush", x: 1460, y: 430, w: 48, h: 42, solid: true },
  { id: "plant3", kind: "plant", x: 1480, y: 280, w: 34, h: 34, solid: true },
  { id: "plant7", kind: "plant", x: 1145, y: 280, w: 32, h: 32, solid: true },
  { id: "bench", kind: "bench", x: 1400, y: 380, w: 100, h: 36, solid: true },
  { id: "bench2", kind: "bench", x: 1145, y: 340, w: 50, h: 90, solid: true },
  { id: "mess4", kind: "mess", x: 1220, y: 430, w: 40, h: 26, solid: false },
  { id: "mess4b", kind: "mess", x: 1380, y: 300, w: 36, h: 24, solid: false },
  { id: "bottle_g", kind: "bottle", x: 1240, y: 350, w: 14, h: 20, solid: false },

  // Confession
  { id: "micbooth", kind: "micbooth", x: 150, y: 530, w: 120, h: 95, solid: true },
  { id: "cchair", kind: "chair", x: 200, y: 650, w: 40, h: 40, solid: true },
  { id: "cchair2", kind: "chair", x: 280, y: 650, w: 40, h: 40, solid: true },
  { id: "camerastand", kind: "camera", x: 340, y: 540, w: 32, h: 55, solid: true },
  { id: "camerastand2", kind: "camera", x: 380, y: 620, w: 32, h: 55, solid: true },
  { id: "spotlight", kind: "lamp", x: 100, y: 500, w: 26, h: 44, solid: true },
  { id: "spotlight2", kind: "lamp", x: 380, y: 500, w: 26, h: 44, solid: true },
  { id: "curtain", kind: "curtain", x: 100, y: 500, w: 22, h: 220, solid: false },
  { id: "curtain2", kind: "curtain", x: 400, y: 500, w: 22, h: 220, solid: false },
  { id: "ctable", kind: "table", x: 250, y: 580, w: 60, h: 40, solid: true },
  { id: "mess5", kind: "mess", x: 300, y: 700, w: 44, h: 28, solid: false },

  // Bedroom
  { id: "bed1", kind: "bed", x: 1150, y: 590, w: 100, h: 140, solid: true },
  { id: "bed2", kind: "bed", x: 1280, y: 590, w: 100, h: 140, solid: true },
  { id: "bed3", kind: "bed", x: 1410, y: 590, w: 100, h: 140, solid: true },
  { id: "bed4", kind: "bed", x: 1150, y: 760, w: 100, h: 100, solid: true },
  { id: "wardrobe", kind: "wardrobe", x: 1280, y: 820, w: 120, h: 44, solid: true },
  { id: "wardrobe2", kind: "wardrobe", x: 1420, y: 820, w: 80, h: 44, solid: true },
  { id: "bchair", kind: "chair", x: 1400, y: 760, w: 38, h: 38, solid: true },
  { id: "btable", kind: "table", x: 1350, y: 770, w: 45, h: 35, solid: true },
  { id: "night1", kind: "crate", x: 1255, y: 600, w: 26, h: 26, solid: true },
  { id: "night2", kind: "crate", x: 1385, y: 600, w: 26, h: 26, solid: true },
  { id: "night3", kind: "crate", x: 1515, y: 600, w: 26, h: 26, solid: true },
  { id: "mess6", kind: "mess", x: 1320, y: 750, w: 55, h: 34, solid: false },
  { id: "clothes", kind: "mess", x: 1200, y: 740, w: 50, h: 32, solid: false },
  { id: "clothes2", kind: "mess", x: 1450, y: 780, w: 40, h: 28, solid: false },
  { id: "bottle3", kind: "bottle", x: 1260, y: 605, w: 12, h: 18, solid: false },
  { id: "lamp_b", kind: "lamp", x: 1520, y: 800, w: 24, h: 40, solid: true },

  // Secret
  { id: "goldtable", kind: "table", x: 700, y: 830, w: 140, h: 80, solid: true },
  { id: "throne", kind: "sofa", x: 730, y: 930, w: 100, h: 48, solid: true },
  { id: "chest", kind: "crate", x: 590, y: 810, w: 55, h: 45, solid: true },
  { id: "chest2", kind: "crate", x: 930, y: 810, w: 55, h: 45, solid: true },
  { id: "chest3", kind: "crate", x: 600, y: 920, w: 40, h: 35, solid: true },
  { id: "lamp2", kind: "lamp", x: 590, y: 900, w: 26, h: 44, solid: true },
  { id: "lamp3", kind: "lamp", x: 970, y: 900, w: 26, h: 44, solid: true },
  { id: "screen", kind: "tv", x: 760, y: 780, w: 110, h: 28, solid: true },
  { id: "scarpet", kind: "carpet", x: 680, y: 820, w: 180, h: 120, solid: false },
  { id: "plate_s", kind: "plate", x: 740, y: 850, w: 22, h: 14, solid: false },
  { id: "bottle_s", kind: "bottle", x: 770, y: 848, w: 14, h: 22, solid: false },

  // Hallways
  { id: "mess7", kind: "mess", x: 520, y: 280, w: 42, h: 28, solid: false },
  { id: "mess8", kind: "mess", x: 500, y: 640, w: 46, h: 32, solid: false },
  { id: "mess9", kind: "mess", x: 1050, y: 300, w: 40, h: 26, solid: false },
  { id: "mess10", kind: "mess", x: 520, y: 520, w: 36, h: 24, solid: false },
  { id: "plant4", kind: "plant", x: 500, y: 500, w: 30, h: 30, solid: true },
  { id: "plant5", kind: "plant", x: 1055, y: 500, w: 30, h: 30, solid: true },
  { id: "plant8", kind: "plant", x: 500, y: 200, w: 28, h: 28, solid: true },
  { id: "plant9", kind: "plant", x: 1055, y: 640, w: 28, h: 28, solid: true },
  { id: "hallbench", kind: "bench", x: 500, y: 360, w: 40, h: 70, solid: true },
];

export const ZONES = ZONES_1X.map(scaleBox);
export const WALLS = WALLS_1X.map(scaleBox);
export const PROPS = PROPS_1X.map(scaleBox);

export const SOLID_PROPS = PROPS.filter((p) => p.solid).map((p) => ({
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
}));
