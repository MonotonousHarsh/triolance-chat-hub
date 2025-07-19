import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5174,
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // → shim `global` to point at `window` in both dev & build
  define: {
    global: "window",
  },

  // → ensure sockjs-client gets pre‑bundled so Vite can apply the shim
  optimizeDeps: {
    include: ["sockjs-client"],
  },
}));
