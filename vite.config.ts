import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

/** In-memory love/hate vibes for local `vite` (mirrors server.mjs). */
function vibesApiPlugin(): Plugin {
  const vibes = {
    love: Object.create(null) as Record<string, number>,
    hate: Object.create(null) as Record<string, number>,
  };

  return {
    name: "bb20-vibes-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/vibes")) return next();

        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };

        if (req.method === "GET") {
          send(200, vibes);
          return;
        }

        if (req.method === "POST") {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const raw = Buffer.concat(chunks).toString("utf8");
            const body = raw ? JSON.parse(raw) : null;
            const handle =
              typeof body?.handle === "string" ? body.handle.trim() : "";
            const type =
              body?.type === "hate"
                ? "hate"
                : body?.type === "love"
                  ? "love"
                  : null;
            if (!type || !handle.startsWith("@") || handle.length > 40) {
              send(400, { error: "Invalid vibe" });
              return;
            }
            vibes[type][handle] = (vibes[type][handle] || 0) + 1;
            send(200, vibes);
          } catch {
            send(400, { error: "Bad JSON" });
          }
          return;
        }

        send(405, { error: "Method not allowed" });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vibesApiPlugin()],
  server: {
    proxy: {
      "/koyro": {
        target: "https://koyro.in",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/koyro/, ""),
        secure: true,
      },
    },
  },
});
