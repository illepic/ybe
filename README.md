# Yacolt Burn Experience

One-page event site for the annual YBE mountain bike shuttle event in the Yacolt Burn State Forest, southwest Washington.

**Live site:** [yacoltburn.bike](https://yacoltburn.bike)

---

## Stack

- [Astro 6](https://astro.build) — static output
- [Alpine.js 3](https://alpinejs.dev) — interactivity
- Custom CSS (BEM, no framework)
- [Netlify](https://netlify.com) — hosting + image CDN

## Getting Started

```bash
nvm use        # Node 24
npm install
npm run dev
```

## Commands

| Command                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Start dev server at localhost:4321             |
| `npm run build`          | Build to `dist/`                               |
| `npm run preview`        | Preview the production build                   |
| `npm run format`         | Run Prettier across all source files           |
| `npm run reg:set -- <n>` | Update the live registration count (see below) |

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

## Updating for Next Year

All event-specific data lives in one place — the `EVENT` object at the top of `src/pages/index.astro`. Update it and everything else follows.

See [CLAUDE.md](./CLAUDE.md) for full project standards and a year-over-year update checklist.

## Project Structure

```
src/
  pages/index.astro        — the entire site
  entrypoints/alpine.js   — Alpine component registrations
  styles/fonts.css         — self-hosted font imports
public/
  photos/                  — section backgrounds + gallery images
  sponsors/                — sponsor logo files
```

## Deployment

Pushes to `main` auto-deploy via Netlify. Build command: `npm run build`, publish directory: `dist/`.
