// Scheduled twin of scripts/watch-registrations.mjs — runs in Netlify on a
// 30-min cron. Same browserless core; the cookie jar lives in a blob (the
// serverless filesystem is ephemeral) so the Remember Me cookie survives
// between runs and a password login happens at most once.
//
// Env (Netlify site env vars): EVERGREEN_USERNAME, EVERGREEN_PASSWORD.
// Blobs auto-configure inside the function runtime — no Netlify token needed.
import { getStore } from '@netlify/blobs';
import { createRosterSync } from '../../scripts/lib/roster.mjs';

export default async () => {
  const username = process.env.EVERGREEN_USERNAME;
  const password = process.env.EVERGREEN_PASSWORD;
  if (!username || !password) {
    console.error('Missing EVERGREEN_USERNAME / EVERGREEN_PASSWORD env vars.');
    return;
  }

  const store = getStore('event');
  const cookieStore = {
    load: async () => {
      const raw = await store.get('evergreen-cookies');
      return raw ? JSON.parse(raw) : {};
    },
    save: (jar) => store.set('evergreen-cookies', JSON.stringify(jar)),
  };

  const sync = createRosterSync({ store, cookieStore, username, password, log: console.log });
  await sync.run();
};

export const config = { schedule: '*/30 * * * *' };
