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
          // Charts - recharts and the full d3 family MUST be in the same chunk to avoid circular dependency / TDZ ReferenceError
          // Note: d3 is often pulled in as many packages (d3-scale, d3-shape, d3-array, etc.), not just `d3/`.
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3') ||
            id.includes('node_modules/d3-')
          ) {
            return 'vendor-charts';
          }
          // Three.js - 3D graphics, keep together to avoid circular dependency
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'vendor-three';
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
          // Form handling - MUST keep resolvers + schema deps together to avoid TDZ circular dependency
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/zod') ||
            id.includes('node_modules/@hookform') ||
            // Zod can pull in the Standard Schema spec packages; keep them co-located with zod/resolvers.
            id.includes('node_modules/@standard-schema')
          ) {
            return 'vendor-forms';
          }
          // Sentry - error tracking
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry';
          }
          // All other vendor modules - don't split to avoid circular deps
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
