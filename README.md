# Circle Push — Web SDK Integration Guide

How to add web push notifications to your **Vite + React** app using
[`@circlehq/push-web`](https://www.npmjs.com/package/@circlehq/push-web).

> This repo is a working sample. The steps below show the same integration
> applied to your own Vite + React project. To run the sample itself, jump
> to [Running this sample](#running-this-sample) at the bottom.

---

## Prerequisites

- Node.js 18+
- A Circle account with a publishable **API key**
- A Vite + React app (TypeScript or JS)

Web Push requires HTTPS or `localhost`. The Vite dev server qualifies.

## 1. Install

```bash
npm install @circlehq/push-web
```

The SDK auto-installs its service worker into your project's `public/`
folder. If your install ran with `--ignore-scripts`, run it manually once:

```bash
npx circle-push install-sw
```

## 2. Add your API key

Create `.env.local` in your project root:

```
VITE_CIRCLE_API_KEY=your_publishable_api_key
```

## 3. Initialize the SDK on app load

In your root component (e.g. `src/App.tsx`), call `init()` once. It's
idempotent, so calling it more than once is safe.

```tsx
import { useEffect } from 'react';
import CirclePush from '@circlehq/push-web';

export default function App() {
  useEffect(() => {
    CirclePush.init({
      apiKey: import.meta.env.VITE_CIRCLE_API_KEY,
    }).catch(console.error);
  }, []);

  return <YourApp />;
}
```

## 4. Identify a user after sign-in

Once your user authenticates, call `identify()` to register the browser as
a push device against that contact:

```tsx
import CirclePush from '@circlehq/push-web';

async function enablePush(email: string) {
  const permission = await CirclePush.requestPermission();
  if (permission !== 'granted') return;

  const device = await CirclePush.identify({ email });
  console.log('Push enabled', device);
}
```

You can identify by `email`, `phone`, or both:

```ts
await CirclePush.identify({ email: 'user@example.com' });
await CirclePush.identify({ phone: '+15551234567' });
```

## 5. Handle notification events (optional)

Subscribe to events anywhere in your app. Always clean up listeners in
the `useEffect` return:

```tsx
import { useEffect } from 'react';
import CirclePush from '@circlehq/push-web';

export function PushListener() {
  useEffect(() => {
    const onReceived = (p: unknown) => console.log('received', p);
    const onClicked  = (p: unknown) => console.log('clicked', p);

    CirclePush.on('notificationReceived', onReceived);
    CirclePush.on('notificationClicked',  onClicked);

    return () => {
      CirclePush.off('notificationReceived', onReceived);
      CirclePush.off('notificationClicked',  onClicked);
    };
  }, []);

  return null;
}
```

## 6. Disable push on sign-out

```ts
await CirclePush.unregister();
```

This unregisters the device and clears local state.

---

## Test it

1. Run your app on `http://localhost:5173` (or any HTTPS origin).
2. Sign a user in and call `identify()`.
3. Send a push from the Circle dashboard targeting that email/phone.
4. The OS notification appears; clicking it fires `notificationClicked`.

## API reference

| Method | Description |
|---|---|
| `CirclePush.init(config)` | Initialize the SDK. Call once on app load. |
| `CirclePush.identify({ email?, phone? })` | Register the browser as a push device for this contact. |
| `CirclePush.requestPermission()` | Prompt the browser for notification permission. |
| `CirclePush.unregister()` | Disable push for this device. |
| `CirclePush.getToken()` | Current FCM token, or `null`. |
| `CirclePush.getPermissionState()` | `'granted' \| 'denied' \| 'default'`. |
| `CirclePush.on(event, handler)` / `off(event, handler)` | Subscribe / unsubscribe. |

**Events:** `permissionChange`, `tokenRefresh`, `notificationReceived`,
`notificationClicked`, `error`.

## Browser support

| Browser | Supported |
|---|---|
| Chrome, Edge, Firefox, Opera (desktop & Android) | ✅ |
| Safari macOS 16.4+ | ✅ |
| Safari iOS 16.4+ | ✅ when installed as a PWA (Add to Home Screen) |

---

## Running this sample

```bash
git clone <this repo>
cd circle-push-web-sample
npm install
echo "VITE_CIRCLE_API_KEY=your_key" > .env.local
npm run dev
```

Open http://localhost:5173, enter an email or phone, and click
**Sign in & enable notifications**. Send a push from the Circle dashboard
to see it arrive.

The full integration code lives in [src/main.ts](src/main.ts).

## Learn more

- [`@circlehq/push-web` on npm](https://www.npmjs.com/package/@circlehq/push-web)
- [Circle Push docs](https://docs.circlehq.co/push/web)
- [Circle dashboard](https://app.circlehq.co)
