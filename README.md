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

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start dev server at localhost:4321   |
| `npm run build`   | Build to `dist/`                     |
| `npm run preview` | Preview the production build         |
| `npm run format`  | Run Prettier across all source files |

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
