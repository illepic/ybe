// Push a new registration count to the `event` Netlify Blob store.
// Usage: npm run reg:set -- <number>
// Requires NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID (loaded from .env by the npm
// script). Takes effect within seconds, no commit or rebuild needed.
import { getStore } from '@netlify/blobs';

const value = process.argv[2];

if (!/^\d+$/.test(value ?? '')) {
  console.error('Usage: npm run reg:set -- <number>   (e.g. npm run reg:set -- 130)');
  process.exit(1);
}

const siteID = process.env.NETLIFY_SITE_ID;
const token = process.env.NETLIFY_AUTH_TOKEN;

if (!siteID || !token) {
  console.error(
    'Missing NETLIFY_SITE_ID and/or NETLIFY_AUTH_TOKEN.\n' +
      'Copy .env.example to .env and fill them in (see CLAUDE.md → Live Registration Count).'
  );
  process.exit(1);
}

const store = getStore({ name: 'event', siteID, token });
await store.set('registered', value);

console.log(`✓ registered = ${value} (live at /api/registered within ~30s)`);
