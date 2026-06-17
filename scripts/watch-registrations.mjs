// Long-running watcher: logs into the Evergreen roster, reads the registration
// total, and pushes it to the `event` Netlify Blob (key `registered`) so the
// live site picks it up via /api/registered. Re-checks every 30 minutes,
// reusing the same Playwright session (persisted to scripts/.auth so restarts
// skip the login too).
//
// Usage: npm run reg:watch   (Ctrl-C to stop)
// Env (.env): EVERGREEN_USERNAME, EVERGREEN_PASSWORD, NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID
import { chromium } from 'playwright';
import { getStore } from '@netlify/blobs';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const ROSTER_URL = 'https://www.evergreenmtb.org/rosters/yacolt-burn-roster-2026';
// The element whose text looks like "Results 1 - 50 of 128" — we want that last number.
const COUNT_SELECTOR = '#filter-bar .btn';
const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const STATE_PATH = 'scripts/.auth/evergreen.json'; // persisted session (git-ignored)

// Joomla-style login form. Adjust if the Evergreen login fields differ.
const LOGIN = {
  username: 'input[name="username"]',
  password: 'input[name="password"]',
  submit: 'button[type="submit"], input[type="submit"]',
};

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

const store = getStore({ name: 'event', siteID: NETLIFY_SITE_ID, token: NETLIFY_AUTH_TOKEN });
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

/** Pull the trailing total out of e.g. "Results 1 - 50 of 128" → 128. */
const parseCount = (text) => {
  const m = /of\s+([\d,]+)/i.exec(text ?? '');
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isInteger(n) && n >= 0 && n < 100000 ? n : null;
};

const hasSelector = async (page, selector, timeout = 4000) => {
  try {
    await page.waitForSelector(selector, { timeout, state: 'attached' });
    return true;
  } catch {
    return false;
  }
};

/** Navigate to the roster; log in if the session has expired. Throws if the
 *  page is neither the roster nor a recognizable login form. */
const ensureRoster = async (page, context) => {
  await page.goto(ROSTER_URL, { waitUntil: 'domcontentloaded' });

  if (await hasSelector(page, COUNT_SELECTOR, 4000)) return; // already logged in

  if (await hasSelector(page, LOGIN.password, 4000)) {
    log('Session expired — logging in.');
    await page.fill(LOGIN.username, EVERGREEN_USERNAME);
    await page.fill(LOGIN.password, EVERGREEN_PASSWORD);
    await page.click(LOGIN.submit);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.goto(ROSTER_URL, { waitUntil: 'domcontentloaded' });
    if (!(await hasSelector(page, COUNT_SELECTOR, 6000))) {
      throw new Error(
        'Logged in but the roster count never appeared — check credentials/selectors.'
      );
    }
    await context.storageState({ path: STATE_PATH });
    log('Login OK, session saved.');
    return;
  }

  throw new Error(
    `Unexpected page (no roster count, no login form). URL: ${page.url()} — title: "${await page.title()}"`
  );
};

const readBlob = async () => {
  const raw = await store.get('registered');
  return raw == null || raw === '' ? null : Number(raw);
};

let lastValue = null;

const checkOnce = async (page, context) => {
  await ensureRoster(page, context);
  const text = (await page.textContent(COUNT_SELECTOR))?.trim();
  const count = parseCount(text);
  if (count == null) {
    log(`Could not parse a count from "${text}" — skipping this cycle.`);
    return;
  }
  if (count === lastValue) {
    log(`Registered = ${count} (unchanged).`);
    return;
  }
  await store.set('registered', String(count));
  lastValue = count;
  log(`Registered = ${count} → pushed to blob.`);
};

const main = async () => {
  await mkdir('scripts/.auth', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(
    existsSync(STATE_PATH) ? { storageState: STATE_PATH } : {}
  );
  const page = await context.newPage();

  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    log('Shutting down.');
    await browser.close().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  lastValue = await readBlob().catch(() => null);
  log(`Watching ${ROSTER_URL} every ${INTERVAL_MS / 60000} min. Starting value: ${lastValue}.`);

  while (!stopping) {
    try {
      await checkOnce(page, context);
    } catch (err) {
      log(`Cycle failed: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
