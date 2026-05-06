# Circle Push — Web Sample

A minimal Vite + TypeScript example showing how to integrate
[`@circlehq/push-web`](https://www.npmjs.com/package/@circlehq/push-web) into a
website to send push notifications via the Circle platform.

The flow mirrors a real integration:

1. The SDK is initialized **on page load** from environment variables.
2. After the user signs in, the app calls `identify()` to register the
   browser as a push device against that contact.
3. Notifications sent from the Circle dashboard appear via the OS, and
   click events are forwarded back to the page.

## Prerequisites

- Node.js 18+
- A Circle account with an **API key**

That's it — the Firebase config and VAPID key are baked into the SDK by
Circle, so you don't need to manage them yourself.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local: set VITE_CIRCLE_API_KEY
npm run dev
```

Open http://localhost:5173, enter an email or phone number, and click
**Sign in & enable notifications**. Your browser will prompt for
notification permission; after you accept, the device is registered
against the contact identified by that email or phone.

To test, send a push from the Circle dashboard (or your backend) targeted
at the same email/phone. The browser will display the notification, and
clicking it will be logged in the **Event log** panel.

## Environment variables

The variable is read at build time by Vite and embedded in the bundle, so
only ship values that are safe in a browser.

| Variable | Description |
| --- | --- |
| `VITE_CIRCLE_API_KEY` | Your Circle publishable API key. |

## How the service worker is wired

Web Push requires a service worker served from the site root at
`/firebase-messaging-sw.js`. The `predev` and `prebuild` scripts copy
the SDK's prebuilt service worker out of `node_modules/@circlehq/push-web`
into `public/`, where Vite serves it automatically.

You don't need to edit or write a service worker yourself — the SDK ships
with one that handles background message rendering and click forwarding.

## Browser support

- **Chrome, Edge, Firefox, Opera (desktop & Android)**: fully supported.
- **Safari macOS 16.4+**: supported.
- **Safari iOS 16.4+**: supported **only** when the site has been
  installed to the Home Screen as a PWA.

Web Push requires a secure context (HTTPS or `localhost`). The Vite dev
server on `127.0.0.1:5173` qualifies.

## Project layout

```
.
├── index.html              UI markup
├── src/
│   ├── main.ts             SDK init + sign-in flow
│   └── env.d.ts            Vite env typings
├── scripts/
│   └── copy-sw.mjs         Copies the SDK service worker into public/
├── .env.example            Template for .env.local
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Learn more

- [`@circlehq/push-web` documentation](https://docs.circlehq.co/push/web)
- [Circle dashboard](https://app.circlehq.co)
