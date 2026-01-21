import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React - always needed
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // React Router - needed for navigation
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // All other vendor modules - keep in a single chunk to avoid cross-chunk circular deps / TDZ
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // Don't auto-inject - we'll handle it manually to avoid render-blocking
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "robots.txt"],
      manifest: {
        name: "Aurelia Private Concierge",
        short_name: "Aurelia",
        description: "The world's most exclusive private concierge service",
        theme_color: "#050810",
        background_color: "#050810",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Completely disable precaching and navigation handling
        globPatterns: [],
        globIgnores: ["**/*"],
        maximumFileSizeToCacheInBytes: 0,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Explicitly disable navigation fallback to prevent createHandlerBoundToURL errors
        navigateFallback: undefined,
        // No runtime caching - everything goes to network
        runtimeCaching: [],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
