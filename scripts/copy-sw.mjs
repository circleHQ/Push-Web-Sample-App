// Copy the SDK's prebuilt service worker into this app's public/ folder so
// it's served at /firebase-messaging-sw.js. Runs automatically before
// `npm run dev` and `npm run build`.
//
// The SW is resolved through Node's module resolution, so it works whether
// `@circlehq/push-web` is installed from npm or linked via `file:`.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let src;
try {
  src = require.resolve('@circlehq/push-web/service-worker');
} catch {
  console.error('✗ Could not resolve @circlehq/push-web service worker.');
  console.error('  Run `npm install` first.');
  process.exit(1);
}

const destDir = resolve(root, 'public');
const dest = resolve(destDir, 'firebase-messaging-sw.js');

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log('✓ Copied service worker -> public/firebase-messaging-sw.js');
