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
          // Framer Motion - heavy animation library, defer loading
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // React Query - data fetching
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }
          // Radix UI components - split by usage frequency
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Charts - only needed on specific pages
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          // Supabase - backend operations
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // i18n - internationalization
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          // Form handling
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          // Sentry - error tracking
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry';
          }
          // All other vendor modules
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
        // Disable all precaching to clear corrupted caches
        globPatterns: [],
        globIgnores: ["**/*"],
        maximumFileSizeToCacheInBytes: 0,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // No runtime caching - use network only to clear corrupted IndexedDB
        runtimeCaching: [
          {
            urlPattern: /.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
