import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
