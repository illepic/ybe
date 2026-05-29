# Yacolt Burn Experience — Project Standards

One-page static event site for the YBE 2026 mountain bike shuttle event.
Live at **yacoltburn.bike**, hosted on Netlify, repo at github.com/illepic/ybe.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Astro 6 (static output) | No SSR, no serverless |
| Interactivity | Alpine.js 3 via `@astrojs/alpinejs` | Never use CDN; always via integration |
| CSS | Custom `<style is:global>` | No Tailwind — custom CSS is the right call for a one-pager |
| Fonts | `@fontsource/bebas-neue`, `@fontsource/inter` | Self-hosted, no Google Fonts CDN |
| Image CDN | Netlify Image CDN | `cdn()` helper in frontmatter |
| Formatter | Prettier + `prettier-plugin-astro` | Auto-runs via Claude Code hook on Edit/Write |
| Node | 24 (pinned via `.nvmrc`) | |
| Deploy | Netlify | `netlify.toml` has build config, headers, redirects |

---

## File Structure

```
src/
  pages/index.astro        — the entire site, one file
  entrypoints/alpine.js   — ALL Alpine.data() registrations live here
  styles/fonts.css         — fontsource imports only
public/
  photos/                  — section background + gallery images (2400px originals)
  sponsors/                — sponsor logos (SVG/PNG, brightness(0)invert(1) filtered)
  logo.png                 — YBE circular badge logo (2796×2743)
  favicon.ico / .png       — Evergreen MTB favicon variants
  llms.txt                 — AI crawler summary
  robots.txt               — allow all, points to sitemap
  _redirects               — /register → registration URL
  site.webmanifest         — PWA manifest
.prettierrc                — Prettier config
.nvmrc                     — Node 24
netlify.toml               — build, cache headers, CSP, Permissions-Policy
```

---

## Updating the Event Each Year

Everything that changes year-to-year is in the `EVENT` const at the top of `src/pages/index.astro`:

```ts
const EVENT = {
  year:        2027,
  name:        'Yacolt Burn Experience 2027',
  date:        'June 19, 2027',        // display format
  dateShort:   'June 19',
  dateDay:     'Saturday, June 19, 2027',
  startTime:   '9:00 AM',
  endTime:     '4:00 PM',
  deadline:    'June 18th',            // online reg closes
  isoStart:    '2027-06-19T09:00:00-07:00',
  isoEnd:      '2027-06-19T16:00:00-07:00',
  capacity:    299,
  priceMember: 35,
  priceGuest:  60,
  priceDayOf:  70,
};
```

Also update:
- `REG` — the CiviCRM registration URL
- `IMG` — swap photo files in `public/photos/` if new backgrounds are used
- `GALLERY_PHOTOS` in `src/entrypoints/alpine.js` — swap placeholder Unsplash photos for real event photos
- Photo credits (`<cite class="photo-credit">`) on each section
- `llms.txt` — update event summary for AI crawlers
- `public/site.webmanifest` — update event name/year

---

## CSS Standards

### BEM Naming — Always
```css
.nav { }              /* block */
.nav__brand { }       /* element */
.nav--scrolled { }    /* modifier */
```

### No ID selectors
Never style against `#id`. Use BEM modifier classes instead.
```css
/* ✗ bad */
#gallery { background-attachment: scroll; }

/* ✓ good */
.panel--scroll { background-attachment: scroll; }
```

### CSS lives outside `</html>`
Astro processes `<style is:global>` tags at the bottom of the component (after `</html>`). This is where all styles go — Vite minifies and hot-reloads them.

### CSS Custom Properties (design tokens)
```css
:root {
  --c-bg:      #100e0c;
  --c-accent:  #c8571b;   /* orange */
  --c-amber:   #e8a23a;   /* yellow */
  --c-text:    #f0ece4;   /* warm white */
  --c-muted:   #aba49a;   /* warm taupe */
  --c-surface: rgba(10, 8, 6, 0.65);  /* dark box backgrounds */
  --c-ol:      rgba(10, 8, 6, 0.62);  /* panel overlay */
  --c-ol-dark: rgba(10, 8, 6, 0.80);  /* dark panel overlay */
  --f-display: 'Bebas Neue', Impact, sans-serif;
  --f-body:    'Inter', system-ui, sans-serif;
}
```

- Green comes from background imagery, not UI
- Orange + amber are the primary accent colors
- Pink (`#c56ef5`) and cyan (`#48dbfb`) appear in gradient headings and countdown

### Rainbow gradient on headings
`.heading--xl` and `.heading--lg` use `background-clip: text` gradient. Works with `filter: drop-shadow()` for legibility; `text-shadow` does NOT work on clipped text.

---

## Alpine.js Standards

### Always register components in the entrypoint
`src/entrypoints/alpine.js` is the single place for `Alpine.data()`, `Alpine.plugin()`:

```js
export default (Alpine) => {
  Alpine.plugin(focus);    // @alpinejs/focus for focus traps
  Alpine.plugin(collapse); // @alpinejs/collapse for accordions
  Alpine.data('myComponent', () => ({ ... }));
};
```

Never use `<script is:inline>` or `document.addEventListener('alpine:init')` — the entrypoint handles init order correctly.

### Modal pattern
```html
<div x-data="photoGallery">
  <div
    x-show="isOpen"
    x-trap="isOpen"          <!-- focus trap via @alpinejs/focus -->
    role="dialog"
    aria-modal="true"
    aria-label="..."
    tabindex="-1"
    @keydown.escape="close()"
    @keydown.arrow-left="prev()"
    @keydown.arrow-right="next()"
  >
```

`close()` method should restore focus to the triggering element:
```js
close() {
  this.isOpen = false;
  this.$nextTick(() => this._trigger?.focus());
},
openAt(i) {
  this._trigger = document.activeElement;
  this.isOpen = true;
}
```

### Accordion pattern
Use `x-collapse` from `@alpinejs/collapse`:
```html
<div x-data="{ open: false }">
  <button @click="open = !open" :aria-expanded="open.toString()">
    Question
  </button>
  <div x-show="open" x-collapse>
    Answer
  </div>
</div>
```

### Nav scroll state
```html
<nav x-data="{ scrolled: false }"
     @scroll.window.passive="scrolled = window.scrollY > 50"
     :class="{ 'nav--scrolled': scrolled }">
```

---

## Image Handling

### Netlify Image CDN helper
In the Astro frontmatter:
```ts
const IS_DEV = import.meta.env.DEV;
const cdn = (path: string, params: Record<string, string> = {}) => {
  if (IS_DEV) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', ...params });
  return `/.netlify/images?${p}`;
};
```

- In dev: raw `/photos/` paths (works locally)
- In prod: Netlify Image CDN with WebP conversion + resizing

### Adding new photos
1. Drop the file in `public/photos/` (original resolution, ~2400px wide)
2. Add a key to `IMG` in the frontmatter
3. Add a `<cite class="photo-credit">` inside the section
4. Update `GALLERY_PHOTOS` in `src/entrypoints/alpine.js` if it goes in the carousel

### OG image
Must be an **absolute URL**, **JPG format** (not WebP), portrait orientation is fine:
```ts
const OG_IMAGE = `${SITE}/.netlify/images?url=/photos/poster.jpg&w=800&format=jpg&q=85`;
```

### Sponsor logos
- Store in `public/sponsors/`
- Rendered with `filter: brightness(0) invert(1)` to normalize to white on dark backgrounds
- SVG preferred; PNG acceptable; avoid JPG (no transparency)

---

## Accessibility

- Skip link at top of `<body>` (`href="#experience"`)
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label`
- Modal buttons: explicit `aria-label` on close/prev/next
- FAQ accordion: `:aria-expanded="open.toString()"` on trigger buttons
- Gallery thumbnails: `loading="lazy" decoding="async"`
- Logo `<img>`: explicit `width`/`height` attributes to prevent CLS

---

## JSON-LD Schema

The event schema is computed in the Astro frontmatter as `JSON_LD` and injected via `set:html` — this lets Prettier parse the file cleanly:

```astro
---
const JSON_LD = JSON.stringify({ '@context': 'https://schema.org', ... });
---
<script type="application/ld+json" set:html={JSON_LD} />
```

Never put Astro expressions inside `<script type="application/ld+json">{...}</script>` — Prettier will fail trying to parse it as JSON.

---

## Performance Notes

- `background-attachment: fixed` causes per-frame GPU repaints — panels that don't benefit from parallax use `.panel--scroll`
- `content-visibility: auto` breaks IntersectionObserver on child elements — do not use
- `will-change: transform` on gallery thumbnails for smoother hover
- `decoding="async"` on all lazy-loaded images
- Reveal animations (`.reveal`) are CSS-only on desktop; disabled on mobile via `@media (min-width: 769px)` and `prefers-reduced-motion`

---

## Deployment

- **Domain**: yacoltburn.bike (A records → Netlify, 75.2.60.5)
- **Build**: `npm run build` → `dist/`
- **Node**: 24 (set in `netlify.toml` and `.nvmrc`)
- **Netlify Image CDN**: free on all plans; `/.netlify/images` URLs only work on deployed site
- **Short URL**: `yacoltburn.bike/register` → CiviCRM registration page (via `_redirects`)

---

## Workflow

- **Do not commit or push without being explicitly asked**
- Run `npm run dev` yourself — Claude will not start the dev server unless asked
- `npm run format` — runs Prettier across all source files
- `npm run format:check` — CI-safe check
- Prettier auto-runs via Claude Code hook after every Edit/Write on `.astro`, `.js`, `.mjs`, `.json`, `.css` files
