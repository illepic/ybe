import { getStore } from '@netlify/blobs';

// Live registration count. Reads the `registered` key from the `event` blob
// store and returns it as JSON. Updated out-of-band via `npm run reg:set` — no
// rebuild needed. If the blob is unset, returns null and the client falls back
// to the build-time number in current.yaml. Blobs access is auto-configured by
// the Netlify function runtime (no env keys needed here).
export default async () => {
  let registered = null;
  try {
    const raw = await getStore('event').get('registered');
    if (raw != null && raw !== '') {
      const n = Number(raw);
      if (Number.isFinite(n)) registered = n;
    }
  } catch {
    // Swallow — the client falls back to the committed default.
  }

  return Response.json(
    { registered },
    { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } }
  );
};

export const config = { path: '/api/registered' };
