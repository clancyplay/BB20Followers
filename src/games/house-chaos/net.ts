import type { GameState, WelcomeMsg } from "./types";

export type HouseSocketHandlers = {
  onWelcome: (msg: WelcomeMsg) => void;
  onState: (msg: GameState) => void;
  onError: (message: string) => void;
  onClose: () => void;
};

function wsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws/house`;
}

export class HouseSocket {
  private ws: WebSocket | null = null;
  private handlers: HouseSocketHandlers;
  private inputTimer: number | null = null;
  private pending = { dx: 0, dy: 0, attack: false };

  constructor(handlers: HouseSocketHandlers) {
    this.handlers = handlers;
  }

  connect(join: {
    name: string;
    handle: string;
    avatarId: string;
  }) {
    this.close();
    const ws = new WebSocket(wsUrl());
    this.ws = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", ...join }));
      this.inputTimer = window.setInterval(() => this.flushInput(), 50);
    };

    ws.onmessage = (ev) => {
      let msg: { type?: string; error?: string };
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (msg.type === "welcome") this.handlers.onWelcome(msg as WelcomeMsg);
      else if (msg.type === "state") this.handlers.onState(msg as GameState);
      else if (msg.type === "error")
        this.handlers.onError(msg.error || "Arena error");
    };

    ws.onclose = () => {
      this.handlers.onClose();
    };

    ws.onerror = () => {
      this.handlers.onError(
        "Could not connect to Game-Ghar. Is the game server running?"
      );
    };
  }

  setMove(dx: number, dy: number) {
    this.pending.dx = dx;
    this.pending.dy = dy;
  }

  attack() {
    this.pending.attack = true;
  }

  private flushInput() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const { dx, dy, attack } = this.pending;
    this.pending.attack = false;
    this.ws.send(JSON.stringify({ type: "input", dx, dy, attack }));
  }

  close() {
    if (this.inputTimer != null) {
      window.clearInterval(this.inputTimer);
      this.inputTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}
