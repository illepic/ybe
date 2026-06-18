// Shared browserless roster sync: Joomla login + count scrape + blob push.
// Used by the local watcher (scripts/watch-registrations.mjs, file-backed
// cookies + a loop) and the Netlify scheduled function
// (netlify/functions/sync-registrations.mjs, blob-backed cookies + cron). The
// cookie store and the `registered` blob store are injected so the same logic
// runs in both places. No filesystem or process.env access in here.

const BASE = 'https://www.evergreenmtb.org';
const LOGIN_URL = `${BASE}/login`;
const LOGIN_POST_URL = `${BASE}/login?task=user.login`;
export const ROSTER_URL = `${BASE}/rosters/yacolt-burn-roster-2026`;
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

/** Pull the trailing total out of "Results 1 - 50 of 128" → 128. Strips tags
 *  first so markup between words can't break the match. */
export const parseCount = (html) => {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ');
  const m = /Results\s+[\d,]+\s*[-–]\s*[\d,]+\s+of\s+([\d,]+)/i.exec(text);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isInteger(n) && n >= 0 && n < 100000 ? n : null;
};

const looksLikeLogin = (finalUrl, html) =>
  /\/login(\?|$)/.test(finalUrl) || /com-users-login__form|task=user\.login/.test(html);

/**
 * @param store        Netlify blob store ('event') for the `registered` count
 * @param cookieStore  { load(): Promise<jar>, save(jar): Promise<void> }
 * @param username/password  Evergreen credentials
 * @param log          message sink
 */
export function createRosterSync({ store, cookieStore, username, password, log = () => {} }) {
  let jar = {};

  const applySetCookies = (res) => {
    for (const sc of res.headers.getSetCookie?.() ?? []) {
      const [pair] = sc.split(';');
      const eq = pair.indexOf('=');
      if (eq < 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (value === '' || value === 'deleted' || /;\s*max-age=0/i.test(sc)) delete jar[name];
      else jar[name] = value;
    }
  };
  const cookieHeader = () =>
    Object.entries(jar)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  // Joomla's session cookie is a 32-hex name; its value changes when a new
  // session is created (e.g. a remember-me restore) — used to label the path.
  const sessionValue = () => {
    for (const [k, v] of Object.entries(jar)) if (/^[a-f0-9]{32}$/.test(k)) return v;
    return null;
  };

  // fetch with the cookie jar + manual redirect following.
  const visit = async (url, { method = 'GET', body, maxRedirects = 6 } = {}) => {
    let current = url;
    let res;
    for (let i = 0; i <= maxRedirects; i++) {
      const headers = { 'User-Agent': UA, Cookie: cookieHeader() };
      if (body && i === 0) headers['Content-Type'] = 'application/x-www-form-urlencoded';
      res = await fetch(current, {
        method: i === 0 ? method : 'GET',
        body: i === 0 ? body : undefined,
        headers,
        redirect: 'manual',
      });
      applySetCookies(res);
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) {
        current = new URL(loc, current).toString();
        continue;
      }
      break;
    }
    return { finalUrl: current, html: await res.text() };
  };

  // Submit the Joomla login form (username/password + per-session CSRF token)
  // with Remember Me so future runs avoid the password.
  const passwordLogin = async () => {
    const { html } = await visit(LOGIN_URL);
    const token = /name="([a-f0-9]{32})"\s+value="1"/i.exec(html)?.[1];
    const ret = /name="return"\s+value="([^"]*)"/i.exec(html)?.[1] ?? '';
    if (!token) throw new Error('Login token not found on /login — page layout may have changed.');
    const body = new URLSearchParams({
      username,
      password,
      remember: 'yes',
      return: ret,
      [token]: '1',
    }).toString();
    await visit(LOGIN_POST_URL, { method: 'POST', body });
    await cookieStore.save(jar);
  };

  // One check: reuse session / silently re-auth / full login, read the count,
  // push to the blob only when it changed. Stateless across calls (compares
  // against the blob's current value), so it's correct for cron too.
  const run = async () => {
    jar = (await cookieStore.load()) ?? {};
    const sessionBefore = sessionValue();
    let { finalUrl, html } = await visit(ROSTER_URL);
    let path;

    if (looksLikeLogin(finalUrl, html)) {
      await passwordLogin();
      ({ finalUrl, html } = await visit(ROSTER_URL));
      if (looksLikeLogin(finalUrl, html)) {
        throw new Error(
          'Still at the login page after submitting credentials — check username/password.'
        );
      }
      path = 'full login (password)';
    } else {
      path =
        sessionBefore && sessionValue() !== sessionBefore
          ? 're-auth (remember-me)'
          : 'session reused';
    }

    const count = parseCount(html);
    if (count == null) {
      log(`No count found (path: ${path}) — skipping.`);
      return { ok: false, path };
    }
    await cookieStore.save(jar);

    const currentRaw = await store.get('registered');
    const current = currentRaw == null || currentRaw === '' ? null : Number(currentRaw);
    if (count === current) {
      log(`Registered = ${count} (unchanged; ${path}).`);
      return { ok: true, count, changed: false, path };
    }
    await store.set('registered', String(count));
    log(`Registered = ${count} → pushed to blob (${path}).`);
    return { ok: true, count, changed: true, path };
  };

  return { run };
}
