import { defineConfig } from 'vite';

// Vite dev server runs on http://localhost:5173 — treated as a secure context
// by browsers, which is required for the Notification + Service Worker APIs.
export default defineConfig({
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  // The SDK is consumed as a regular dep; nothing special needed here.
});
