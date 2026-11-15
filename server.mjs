import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { attachHouseRoom } from "./server/house-room.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(__dirname, "dist");
const PORT = Number(process.env.PORT) || 8080;
const KOYRO_ORIGIN = "https://koyro.in";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** Simple in-memory rate limit for KOYRO proxy (per IP). */
const hits = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

/** Fan love/hate vibes — in-memory (resets on redeploy). */
const vibes = { love: Object.create(null), hate: Object.create(null) };
const vibeHits = new Map();
const VIBE_RATE_MAX = 40;
const ALLOWED_HANDLES = new Set([
  "@arishfakhan138",
  "@officialkanikamann",
  "@aamrapali1101",
  "@scoutop",
  "@yung_dsa",
  "@nakul_dhull",
  "@mahhivij",
  "@qazitouqeer_official",
  "@mcmary.kom",
  "@fun.with.gullu.g",
  "@uditisinghh",
  "@lovegillkalakaar",
  "@isharikhi",
  "@aasifkhan_1",
  "@gandhi_aman_",
  "@rohedkhan__",
  "@rhititiwari",
  "@abhinetamanishgoel",
]);

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function allowRate(map, ip, max) {
  const now = Date.now();
  const row = map.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > row.reset) {
    row.count = 0;
    row.reset = now + RATE_WINDOW_MS;
  }
  row.count += 1;
  map.set(ip, row);
  return row.count <= max;
}

function allowProxy(ip) {
  return allowRate(hits, ip, RATE_MAX);
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  return JSON.parse(raw);
}

async function handleVibes(req, res) {
  if (req.method === "GET") {
    json(res, 200, vibes);
    return;
  }
  if (req.method === "POST") {
    const ip = clientIp(req);
    if (!allowRate(vibeHits, ip, VIBE_RATE_MAX)) {
      json(res, 429, { error: "Too many vibes. Try again shortly." });
      return;
    }
    try {
      const body = await readBody(req);
      const handle = typeof body?.handle === "string" ? body.handle.trim() : "";
      const type = body?.type === "hate" ? "hate" : body?.type === "love" ? "love" : null;
      if (!type || !handle || !ALLOWED_HANDLES.has(handle)) {
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
  json(res, 405, { error: "Method not allowed" });
}

async function proxyKoyro(req, res, path) {
  const ip = clientIp(req);
  if (!allowProxy(ip)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Too many refresh requests. Try again shortly.",
      })
    );
    return;
  }

  const target = `${KOYRO_ORIGIN}${path}`;
  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: req.headers.accept || "*/*",
        "User-Agent":
          "BB20Followers/1.0 (+https://github.com/clancyplay/BB20Followers)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    });

    const headers = {
      "Cache-Control": path.includes("/avatar")
        ? "public, max-age=3600"
        : "public, max-age=120",
    };
    const ct = upstream.headers.get("content-type");
    if (ct) headers["Content-Type"] = ct;

    res.writeHead(upstream.status, headers);
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    console.error("KOYRO proxy error", err);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Upstream unavailable" }));
  }
}

function safeStaticPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const resolved = normalize(join(DIST, clean));
  if (!resolved.startsWith(DIST)) return null;
  return resolved;
}

async function serveStatic(req, res, urlPath) {
  let filePath = safeStaticPath(urlPath === "/" ? "/index.html" : urlPath);
  if (!filePath) {
    res.writeHead(400).end("Bad path");
    return;
  }

  if (!existsSync(filePath)) {
    filePath = join(DIST, "index.html");
  }

  const type = MIME[extname(filePath)] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url.pathname.startsWith("/koyro/")) {
    const path = url.pathname.replace(/^\/koyro/, "") + url.search;
    await proxyKoyro(req, res, path);
    return;
  }

  if (url.pathname === "/api/vibes") {
    await handleVibes(req, res);
    return;
  }

  await serveStatic(req, res, url.pathname);
});

if (!existsSync(DIST)) {
  console.error("Missing dist/. Run npm run build first.");
  process.exit(1);
}

attachHouseRoom(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BB20Followers listening on :${PORT}`);
});
