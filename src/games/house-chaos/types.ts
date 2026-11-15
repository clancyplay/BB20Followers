export type Zone = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

export type Wall = { x: number; y: number; w: number; h: number };

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
  label: string;
  x: number;
  y: number;
};

export type GameState = {
  type: "state";
  t: number;
  world: { w: number; h: number };
  zones: Zone[];
  walls: Wall[];
  players: NetPlayer[];
  enemies: NetEnemy[];
  items: NetItem[];
  online: number;
};

export type WelcomeMsg = {
  type: "welcome";
  id: string;
  map: { w: number; h: number; zones: Zone[]; walls: Wall[] };
  state: GameState;
};
