/** Load /ghar/*.svg once and reuse via drawImage. */

const KIND_TO_SPRITE: Record<string, string> = {
  sofa: "sofa",
  chair: "chair",
  table: "table",
  bed: "bed",
  fridge: "fridge",
  stove: "stove",
  sink: "sink",
  counter: "counter",
  pool: "pool",
  plant: "plant",
  bush: "bush",
  tv: "tv",
  carpet: "carpet",
  mess: "mess",
  plate: "plate",
  bottle: "bottle",
  lamp: "lamp",
  crate: "crate",
  trash: "trash",
  pot: "pot",
  lounger: "lounger",
  umbrella: "umbrella",
  bench: "bench",
  micbooth: "micbooth",
  camera: "camera",
  curtain: "curtain",
  wardrobe: "wardrobe",
};

const PICKUP_SPRITE: Record<string, string> = {
  maggi: "pickup_maggi",
  tomato: "pickup_tomato",
  mic: "pickup_mic",
  luxury: "pickup_luxury",
  captain: "pickup_captain",
};

const ENEMY_SPRITE: Record<string, string> = {
  biggBoss: "enemy_bb",
  salman: "enemy_sk",
  editor: "enemy_ed",
  camera: "enemy_cam",
};

const cache = new Map<string, HTMLImageElement>();
let loadPromise: Promise<void> | null = null;

function loadOne(name: string): Promise<void> {
  if (cache.has(name)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cache.set(name, img);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `/ghar/${name}.svg`;
  });
}

const ALL_NAMES = [
  ...new Set([
    ...Object.values(KIND_TO_SPRITE),
    ...Object.values(PICKUP_SPRITE),
    ...Object.values(ENEMY_SPRITE),
    "body_self",
    "body_other",
    "body_bot",
    "body_attack",
    "floor_wood",
    "floor_tile",
    "floor_grass",
    "floor_purple",
    "floor_gold",
  ]),
];

export function loadGharSprites(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all(ALL_NAMES.map(loadOne)).then(() => undefined);
  }
  return loadPromise;
}

export function sprite(name: string): HTMLImageElement | null {
  return cache.get(name) ?? null;
}

export function propSprite(kind: string): HTMLImageElement | null {
  const key = KIND_TO_SPRITE[kind];
  return key ? sprite(key) : null;
}

export function pickupSprite(kind: string): HTMLImageElement | null {
  const key = PICKUP_SPRITE[kind];
  return key ? sprite(key) : null;
}

export function enemySprite(kind: string): HTMLImageElement | null {
  const key = ENEMY_SPRITE[kind];
  return key ? sprite(key) : null;
}

export function bodySprite(
  isSelf: boolean,
  bot: boolean | undefined,
  attacking: boolean | undefined
): HTMLImageElement | null {
  if (attacking) return sprite("body_attack");
  if (isSelf) return sprite("body_self");
  if (bot) return sprite("body_bot");
  return sprite("body_other");
}

export function floorSpriteForZone(zoneId: string): HTMLImageElement | null {
  if (zoneId === "kitchen") return sprite("floor_tile");
  if (zoneId === "garden") return sprite("floor_grass");
  if (zoneId === "confession") return sprite("floor_purple");
  if (zoneId === "secret") return sprite("floor_gold");
  return sprite("floor_wood");
}
