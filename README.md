# Yacolt Burn Experience

One-page event site for the annual YBE mountain bike shuttle event in the Yacolt Burn State Forest, southwest Washington.

**Live site:** [yacoltburn.bike](https://yacoltburn.bike)

---

## Stack

- [Astro 6](https://astro.build) — static output
- [Alpine.js 3](https://alpinejs.dev) — interactivity
- [Tailwind CSS v4](https://tailwindcss.com) — styling (BEM class names kept alongside utilities for semantics + Alpine hooks)
- [Starwind UI](https://starwind.dev) — component primitives (accordion, dialog, card, carousel, tooltip…)
- [Leaflet](https://leafletjs.com) — the "How to get there" map
- Self-hosted fonts via [Fontsource](https://fontsource.org) (Bebas Neue, Inter)
- [Netlify](https://netlify.com) — hosting, image CDN, and Blobs + a serverless function for the live registration count

## Getting Started

```bash
nvm use        # Node 24
npm install
npm run dev
```

## Commands

| Command                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Start dev server at localhost:4321                   |
| `npm run build`          | Build to `dist/`                                     |
| `npm run preview`        | Preview the production build                         |
| `npm run format`         | Run Prettier across all source files                 |
| `npm run format:check`   | Check formatting without writing (CI-safe)           |
| `npm run gen:trails`     | Regenerate curated map data (`src/data/trails.json`) |
| `npm run reg:set -- <n>` | Update the live registration count (see below)       |
| `npm run reg:watch`      | Auto-scrape the count from the roster every 30 min   |

## Updating the Registration Count

The number of registered riders is served **live** — update it without a commit or a rebuild:

```bash
npm run reg:set -- 130
```

The new number appears on the site within ~30 seconds, no deploy needed.

**One-time setup:** copy `.env.example` to `.env` (it's git-ignored) and fill in:

| Key                  | Where to find it                                                                   |
| -------------------- | ---------------------------------------------------------------------------------- |
| `NETLIFY_AUTH_TOKEN` | Netlify → User settings → Applications → Personal access tokens → New access token |
| `NETLIFY_SITE_ID`    | Netlify → Site configuration → General → Site details → Site ID                    |

**How it works:** the count is stored in a Netlify Blob (`event` store, key `registered`). A serverless function (`netlify/functions/registered.mjs`, served at `/api/registered`) returns it, and the page fetches it on load. If the blob is empty or the fetch fails, the site falls back to the `registered` value committed in `src/content/event/current.yaml`, so it's safe either way. Full details in [CLAUDE.md](./CLAUDE.md) → _Live Registration Count_.

> The live count only runs in the Netlify environment (deploy preview, production, or local `netlify dev`) — not under `astro preview`.

### Automating it (roster scraper)

Instead of running `reg:set` by hand, `npm run reg:watch` keeps the number current automatically. It uses Playwright to log into the Evergreen roster, read the registration total, and push it to the blob — re-checking every 30 minutes and reusing the same session. It needs `EVERGREEN_USERNAME` + `EVERGREEN_PASSWORD` in `.env` (in addition to the Netlify keys above). Leave it running on any always-on machine; `Ctrl-C` to stop.

Playwright is a **dev-only** dependency — `netlify.toml` sets `NPM_FLAGS=--omit=dev` so Netlify never installs Playwright or its browser binary.

## Updating for Next Year

Event details live in content collections: `src/content/event/current.yaml` (dates, times, capacity, prices, registration URL) and `src/content/sponsors/current.yaml` (sponsor tiers). Update those and the rest of the site follows.

See [CLAUDE.md](./CLAUDE.md) for full project standards and a year-over-year update checklist.

## Project Structure

```
src/
  pages/index.astro       — the whole page
  layouts/                — base HTML layout
  components/             — Astro components (incl. starwind/ UI primitives)
  content/                — event + sponsor data (YAML collections)
  data/                   — map routes, Trailforks data, gallery list
  entrypoints/alpine.js   — Alpine component registrations
  styles/                 — Tailwind entry, fonts, Starwind overrides
  lib/utils/              — helpers (Netlify image cdn())
netlify/functions/        — serverless function for the live reg count
scripts/                  — set-registered.mjs (npm run reg:set)
public/                   — photos, sponsor logos, static assets
```

## Deployment

Pushes to `main` auto-deploy via Netlify. Build command: `npm run build`, publish directory: `dist/`.
