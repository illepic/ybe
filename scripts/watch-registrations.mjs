// Local long-running watcher: every 30 min, sync the Evergreen roster count to
// the `event` Netlify Blob (key `registered`). Browserless (plain fetch). Logs
// in with a password at most once, persisting cookies (incl. Joomla's Remember
// Me cookie) to scripts/.auth so restarts skip the password too.
//
// The cloud twin is netlify/functions/sync-registrations.mjs (same core, cookie
// jar in a blob, cron-scheduled). Run this one when you're at your laptop.
//
// Usage: npm run reg:watch   (Ctrl-C to stop)
// Env (.env): EVERGREEN_USERNAME, EVERGREEN_PASSWORD, NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID
import { getStore } from '@netlify/blobs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRosterSync, ROSTER_URL } from './lib/roster.mjs';

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const COOKIE_PATH = 'scripts/.auth/evergreen-cookies.json'; // git-ignored

const { EVERGREEN_USERNAME, EVERGREEN_PASSWORD, NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN } = process.env;

for (const [k, v] of Object.entries({
  EVERGREEN_USERNAME,
  EVERGREEN_PASSWORD,
  NETLIFY_SITE_ID,
  NETLIFY_AUTH_TOKEN,
})) {
  if (!v) {
    console.error(`Missing ${k}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

// Locally we write the blob from outside the Netlify runtime, so it needs creds.
const store = getStore({ name: 'event', siteID: NETLIFY_SITE_ID, token: NETLIFY_AUTH_TOKEN });

const cookieStore = {
  load: async () => {
    try {
      return JSON.parse(await readFile(COOKIE_PATH, 'utf8'));
    } catch {
      return {};
    }
  },
  save: (jar) => writeFile(COOKIE_PATH, JSON.stringify(jar)).catch(() => {}),
};

const sync = createRosterSync({
  store,
  cookieStore,
  username: EVERGREEN_USERNAME,
  password: EVERGREEN_PASSWORD,
  log,
});

await mkdir('scripts/.auth', { recursive: true });

let stopping = false;
const shutdown = () => {
  if (stopping) return;
  stopping = true;
  log('Shutting down.');
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

log(`Watching ${ROSTER_URL} every ${INTERVAL_MS / 60000} min.`);
while (!stopping) {
  try {
    await sync.run();
  } catch (err) {
    log(`Cycle failed: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, INTERVAL_MS));
}
