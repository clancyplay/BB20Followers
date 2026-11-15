export type Zone = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  floor?: string;
};

export type Wall = { x: number; y: number; w: number; h: number };

export type MapProp = {
  id: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
  solid?: boolean;
};

export type NetPlayer = {
  id: string;
  name: string;
  handle: string;
  avatarId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  score: number;
  alive: boolean;
  buff: string | null;
  bot?: boolean;
  attacking?: boolean;
};

export type NetEnemy = {
  id: string;
  kind: string;
  label: string;
  x: number;
  y: number;
  hp: number;
  color: string;
};

export type NetItem = {
  id: string;
  kind: string;
  label?: string;
  x: number;
  y: number;
};

export type GameMap = {
  w: number;
  h: number;
  zones: Zone[];
  walls: Wall[];
  props?: MapProp[];
};

/** Lean tick — no map geometry. */
export type GameState = {
  type: "state";
  t: number;
  players: NetPlayer[];
  enemies: NetEnemy[];
  items: NetItem[];
  online: number;
};

export type WelcomeMsg = {
  type: "welcome";
  id: string;
  map: GameMap;
  state: GameState;
};

export type HudSnap = {
  hp: number;
  maxHp: number;
  score: number;
  buff: string | null;
  online: number;
  inHouse: number;
  alive: boolean;
};
