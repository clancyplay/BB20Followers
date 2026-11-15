/**
 * Dev-only WS + vibes API on :8787 so Vite can proxy /ws and /api.
 * Run: node game-dev.mjs   (alongside npm run dev)
 */
import { createServer } from "node:http";
import { attachHouseRoom } from "./server/house-room.mjs";

const PORT = Number(process.env.GAME_DEV_PORT) || 8787;

/** Minimal vibes store for local parity with server.mjs */
const vibes = { love: Object.create(null), hate: Object.create(null) };

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/vibes") {
    if (req.method === "GET") {
      json(res, 200, vibes);
      return;
    }
    if (req.method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const handle = typeof body.handle === "string" ? body.handle.trim() : "";
        const type =
          body.type === "hate" ? "hate" : body.type === "love" ? "love" : null;
        if (!type || !handle.startsWith("@")) {
          json(res, 400, { error: "Invalid vibe" });
          return;
        }
        vibes[type][handle] = (vibes[type][handle] || 0) + 1;
        json(res, 200, vibes);
      } catch {
        json(res, 400, { error: "Bad JSON" });
      }
      return;
    }
  }

  if (url.pathname === "/health") {
    json(res, 200, { ok: true, gameDev: true });
    return;
  }

  res.writeHead(404).end("game-dev: use /ws/house");
});

attachHouseRoom(server);
server.listen(PORT, "127.0.0.1", () => {
  console.log(`House Chaos game-dev on http://127.0.0.1:${PORT} (WS /ws/house)`);
});
