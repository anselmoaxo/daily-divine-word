import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nitro } from "nitro/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // Bind to loopback for local development. Binding to IPv6 wildcard (::)
    // can be blocked by restricted environments and is unnecessary here.
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), nitro()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
