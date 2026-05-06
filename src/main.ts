import CirclePush, { type CirclePushConfig } from '@circlehq/push-web';

// ─── DOM helpers ─────────────────────────────────────────────────────
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const logEl = $('log') as HTMLPreElement;

const log = (level: 'info' | 'warn' | 'error', ...args: unknown[]): void => {
  const ts = new Date().toISOString().slice(11, 19);
  const line = `[${ts}] ${level.toUpperCase()} ${args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a, null, 2)))
    .join(' ')}\n`;
  logEl.textContent += line;
  logEl.scrollTop = logEl.scrollHeight;
};

const showFatal = (msg: string): void => {
  const el = $('config-error');
  el.textContent = msg;
  el.hidden = false;
  ($('btn-identify') as HTMLButtonElement).disabled = true;
  ($('btn-unregister') as HTMLButtonElement).disabled = true;
};

// ─── Build config from Vite env ──────────────────────────────────────
function readConfig(): CirclePushConfig {
  const apiKey = import.meta.env.VITE_CIRCLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Missing VITE_CIRCLE_API_KEY. Copy .env.example to .env.local and fill it in.',
    );
  }
  return {
    apiKey,
    apiBaseUrl: import.meta.env.VITE_CIRCLE_API_BASE_URL,
    debug: import.meta.env.DEV,
  };
}

// ─── Status panel ────────────────────────────────────────────────────
function refreshStatus(): void {
  $('s-version').textContent = CirclePush.version;
  $('s-permission').textContent = CirclePush.getPermissionState();
  void CirclePush.getToken().then((t) => {
    $('s-token').textContent = t ? `${t.slice(0, 8)}…${t.slice(-4)}` : '—';
  });
}

// ─── Wire SDK events ─────────────────────────────────────────────────
CirclePush.on('permissionChange', (p) => log('info', 'permissionChange:', p));
CirclePush.on('tokenRefresh', (t) =>
  log('info', 'tokenRefresh:', { old: t.oldToken?.slice(0, 8), new: t.newToken.slice(0, 8) }),
);
CirclePush.on('notificationReceived', (p) => log('info', 'notificationReceived:', p));
CirclePush.on('notificationClicked', (p) => log('info', 'notificationClicked:', p));
CirclePush.on('error', (e) => log('error', `SDK error ${e.code}:`, e.message));

// ─── Init on page load ───────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  refreshStatus();
  let cfg: CirclePushConfig;
  try {
    cfg = readConfig();
  } catch (e) {
    showFatal((e as Error).message);
    log('error', (e as Error).message);
    return;
  }
  try {
    await CirclePush.init(cfg);
    log('info', 'SDK initialized');
    refreshStatus();
  } catch (e) {
    const err = e as { code?: string; message?: string };
    const msg = `SDK init failed: ${err.code ?? ''} ${err.message ?? String(e)}`;
    showFatal(msg);
    log('error', msg);
  }
}
void bootstrap();
setInterval(refreshStatus, 2000);

// ─── Sign in (identify + permission + token registration) ────────────
$('btn-identify').addEventListener('click', async () => {
  const email = ($('email') as HTMLInputElement).value.trim();
  const phone = ($('phone') as HTMLInputElement).value.trim();
  if (!email && !phone) {
    log('warn', 'Enter an email or phone before signing in.');
    return;
  }

  const btn = $('btn-identify') as HTMLButtonElement;
  btn.disabled = true;
  try {
    const perm = await CirclePush.requestPermission();
    log('info', 'permission:', perm);
    if (perm !== 'granted') {
      log('warn', 'Notification permission was not granted; aborting sign in.');
      return;
    }

    const identity: { email?: string; phone?: string } = {};
    if (email) identity.email = email;
    if (phone) identity.phone = phone;
    const device = await CirclePush.identify(identity);

    $('s-device').textContent = device.deviceId;
    $('s-contact').textContent = device.contactId;
    log('info', 'Signed in. Device registered for push.', device);
    refreshStatus();
  } catch (e) {
    const err = e as { code?: string; message?: string };
    log('error', 'sign in failed', err.code ?? '', err.message ?? String(e));
  } finally {
    btn.disabled = false;
  }
});

// ─── Disable notifications (unregister) ──────────────────────────────
$('btn-unregister').addEventListener('click', async () => {
  const btn = $('btn-unregister') as HTMLButtonElement;
  btn.disabled = true;
  try {
    await CirclePush.unregister();
    $('s-device').textContent = '—';
    $('s-contact').textContent = '—';
    log('info', 'Notifications disabled for this device.');
    refreshStatus();
  } catch (e) {
    log('error', 'unregister failed', String(e));
  } finally {
    btn.disabled = false;
  }
});
