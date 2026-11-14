import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

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

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function allowProxy(ip) {
  const now = Date.now();
  const row = hits.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > row.reset) {
    row.count = 0;
    row.reset = now + RATE_WINDOW_MS;
  }
  row.count += 1;
  hits.set(ip, row);
  return row.count <= RATE_MAX;
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

  await serveStatic(req, res, url.pathname);
});

if (!existsSync(DIST)) {
  console.error("Missing dist/. Run npm run build first.");
  process.exit(1);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BB20Followers listening on :${PORT}`);
});
