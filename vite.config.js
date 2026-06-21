import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = "https://back-end-cupim.onrender.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api-proxy": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
      },
    },
  },
});
