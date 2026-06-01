# Yacolt Burn Experience — Project Standards

One-page static event site for the YBE 2026 mountain bike shuttle event.
Live at **yacoltburn.bike**, hosted on Netlify, repo at github.com/illepic/ybe.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Astro 6 (static output) | No SSR, no serverless |
| Interactivity | Alpine.js 3 via `@astrojs/alpinejs` | Never use CDN; always via integration |
| CSS | Tailwind v4 via `@tailwindcss/vite` | Single entry point: `src/styles/tailwind.css` |
| Fonts | `@fontsource/bebas-neue`, `@fontsource/inter` | Self-hosted, no Google Fonts CDN |
| Image CDN | Netlify Image CDN | `cdn()` helper in frontmatter; `optimizeLogo()` in SponsorTier |
| Formatter | Prettier + `prettier-plugin-astro` | Run manually via `npm run format` — hook is disabled |
| Node | 24 (pinned via `.nvmrc`) | |
| Deploy | Netlify | `netlify.toml` has build config, headers, redirects |

---

## File Structure

```
src/
  pages/index.astro          — the entire site; EVENT config, SPONSORS data, all sections
  entrypoints/alpine.js      — ALL Alpine.store(), Alpine.data(), Alpine.plugin() calls
  styles/tailwind.css        — Tailwind entry point: @theme, @utility, @keyframes
  styles/fonts.css           — fontsource imports only
  components/
    Button.astro             — variants: fire, amber, ghost, logo
    Content.astro            — body text wrapper
    ContentLink.astro        — inline link with amber underline
    Countdown.astro          — days/hrs/min display (Alpine countdown data)
    DateLocation.astro       — date badge + geo: URI location link
    DetailCard.astro         — icon + label + value card
    Eyebrow.astro            — small all-caps label above headings
    Faq.astro / FaqItem.astro — accordion FAQ (x-collapse)
    Gallery.astro            — photo grid + modal (Alpine photoGallery)
    HeadingRainbow.astro     — gradient display heading (xl/lg sizes)
    Lead.astro               — large intro paragraph
    Nav.astro                — fixed nav; hides when gallery modal opens
    Panel.astro              — full-screen section with bg image + overlay + anchor-copy btn
    PhotoCredit.astro        — photo attribution cite
    Pricing.astro / PricingRow.astro — registration pricing table
    Rule.astro               — decorative purple rule
    SponsorTier.astro        — gold/silver/bronze sponsor logo grid
public/
  photos/                    — section backgrounds + gallery images (2400px originals)
  sponsors/                  — sponsor logos (SVG preferred; PNG/WebP acceptable)
  logo.png                   — YBE circular badge logo (2796×2743)
  favicon.ico / .png         — Evergreen MTB favicon variants
  llms.txt                   — AI crawler summary
  robots.txt                 — allow all, points to sitemap
  _redirects                 — /register → registration URL
  site.webmanifest           — PWA manifest
temp/                        — scratch dir for AI/logo files; never committed
.prettierrc                  — Prettier config
.nvmrc                       — Node 24
netlify.toml                 — build, cache headers, CSP, Permissions-Policy
```

---

## Updating the Event Each Year

Everything that changes year-to-year is in the `EVENT` const at the top of `src/pages/index.astro`:

```ts
const EVENT = {
  year:        2027,
  name:        'Yacolt Burn Experience 2027',
  date:        'June 19, 2027',
  dateShort:   'June 19',
  dateDay:     'Saturday, June 19, 2027',
  startTime:   '9:00 AM',
  endTime:     '4:00 PM',
  deadline:    'June 18th',
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
- `GALLERY_PHOTOS` in `src/entrypoints/alpine.js` — swap for real event photos
- Photo credits (`<PhotoCredit>`) on each section
- `SPONSORS` data — update logos, URLs, tier assignments
- `llms.txt` — update event summary for AI crawlers
- `public/site.webmanifest` — update event name/year
- JSON-LD `geo` coordinates if trailhead changes

---

## CSS Standards

### Tailwind v4 — Primary Approach

Tailwind v4 is the CSS layer. No `<style is:global>` blocks. All custom CSS lives in `src/styles/tailwind.css`.

```css
/* src/styles/tailwind.css */
@import 'tailwindcss';
@import './fonts.css';

[x-cloak] { display: none !important; }

@theme {
  --font-display: 'Bebas Neue', Impact, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  /* Only font tokens here — use standard Tailwind colors, no custom color tokens */
}

@utility animate-fade-up { ... }
@utility gradient-rainbow-text { ... }
@utility gradient-rainbow-rule { ... }
@utility reveal { ... }
```

### Writing CSS the Tailwind v4 Way

**Never write raw `@media` queries in `tailwind.css`.** Use `@variant` instead — this keeps breakpoints in sync with whatever is defined in Tailwind's config:

```css
/* ❌ hand-written */
@media (min-width: 769px) { .panel { background-image: var(--bg-desktop); } }
@media (prefers-reduced-motion: reduce) { ... }

/* ✅ Tailwind way */
@layer components {
  .panel {
    background-image: var(--bg-mobile, var(--bg-desktop));
    @variant md { background-image: var(--bg-desktop); }
  }
}

@utility reveal {
  @variant md { opacity: 0; ... }
  @variant motion-reduce { transition: none; ... }
}
```

**Available `@variant` shortcuts:** `sm`, `md`, `lg`, `xl`, `2xl`, `dark`, `motion-reduce`, `hover`, `focus`, `print`, and any other Tailwind variant.

**Wrap non-utility component styles in `@layer components`** so `@variant` resolves correctly outside of `@utility` blocks.

**`text-shadow-*` utilities are Tailwind v4 built-ins** — `text-shadow-sm`, `text-shadow-md`, `text-shadow-lg`, `text-shadow-xl` all work without any custom definition; they read from `--text-shadow-*` theme tokens.

### Arbitrary Values — When to Use vs Replace

**Replace with standard Tailwind when possible:**
- `bg-[rgba(0,0,0,0.8)]` → `bg-black/80`
- `text-[rgba(...,0.5)]` → `text-stone-100/50`
- `h-[120px]` → `h-30` (Tailwind v4 continuous scale: every 0.25rem step is valid)
- `w-[52px]` → `w-13`, `h-[68px]` → `h-17`, `pt-[5.5rem]` → `pt-22`
- `tracking-[0.1em]` → `tracking-widest`

**Keep as arbitrary (no clean equivalent):**
- `text-[clamp(...)]` — fluid typography, no Tailwind equivalent
- `leading-[0.93]` — tight display font leading, below `leading-none`
- `max-w-[640px/720px/460px]` — specific design dimensions
- `tracking-[0.03em/0.04em/0.06em]` — fine-tuned display font spacing
- `drop-shadow-[...]`, `transition-[transform,opacity]` — specific CSS function values

**Never add custom color tokens to `@theme`.** Use standard Tailwind colors. For tier colors: silver → `stone-300`, bronze → `amber-600`.

### BEM Naming — Always Keep

BEM class names are retained alongside Tailwind utilities for semantics and Alpine.js hooks:

```html
<nav class="nav fixed inset-x-0 top-0 z-200 ...">
<div class="panel__inner relative z-[1] w-full max-w-4xl ...">
```

### No ID Selectors

Never style against `#id`. BEM modifier classes only.

### Rainbow Gradient on Headings

`gradient-rainbow-text` uses `background-clip: text` + `-webkit-text-fill-color: transparent`. This means:
- `text-shadow` does NOT work — use `drop-shadow-[...]` (filter-based) instead
- `drop-shadow-[2px_4px_12px_rgba(0,0,0,0.6)]` is the current legibility shadow

---

## Alpine.js Standards

### Always Register in the Entrypoint

`src/entrypoints/alpine.js` is the single place for everything Alpine:

```js
export default (Alpine) => {
  Alpine.plugin(focus);
  Alpine.plugin(collapse);
  Alpine.store('ui', { galleryOpen: false });
  Alpine.data('myComponent', () => ({ ... }));
};
```

Never use `<script is:inline>` or `document.addEventListener('alpine:init')`.

### Global Store Pattern

Use `Alpine.store()` to share state between components (e.g. gallery open state → nav visibility):

```js
// In entrypoint:
Alpine.store('ui', { galleryOpen: false });

// In a component method:
this.$store.ui.galleryOpen = true;

// In a template:
:class="{ 'opacity-0 pointer-events-none': $store.ui.galleryOpen }"
```

### Modal Pattern

```html
<div x-data="photoGallery">
  <div
    x-show="isOpen"
    x-trap="isOpen"
    role="dialog"
    aria-modal="true"
    aria-label="..."
    tabindex="-1"
    @keydown.escape="close()"
    @keydown.arrow-left="prev()"
    @keydown.arrow-right="next()"
  >
```

`close()` restores focus to the triggering element:
```js
close() {
  this.isOpen = false;
  this.$store.ui.galleryOpen = false;
  this.$nextTick(() => this._trigger?.focus());
},
openAt(i) {
  this._trigger = document.activeElement;
  this.isOpen = true;
  this.$store.ui.galleryOpen = true;
}
```

### Accordion Pattern

```html
<div x-data="{ open: false }">
  <button @click="open = !open" :aria-expanded="open.toString()">Question</button>
  <div x-show="open" x-collapse>Answer</div>
</div>
```

### Nav Scroll + Gallery Hide

```html
<nav
  x-data="{ scrolled: false }"
  @scroll.window.passive="scrolled = window.scrollY > 50"
  :class="{
    'bg-black/90 backdrop-blur-md': scrolled,
    'opacity-0 pointer-events-none': $store.ui.galleryOpen
  }"
  class="... transition duration-300 ease-linear"
>
```

---

## Image Handling

### Netlify Image CDN Helper

Defined in `index.astro` frontmatter for section backgrounds, and in `SponsorTier.astro` for sponsor bitmaps:

```ts
const IS_DEV = import.meta.env.DEV;
const cdn = (path: string, params: Record<string, string> = {}) => {
  if (IS_DEV) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', ...params });
  return `/.netlify/images?${p}`;
};
```

- Dev: raw paths (no CDN)
- Prod: WebP conversion + resizing via `/.netlify/images`

### Sponsor Logo Optimization

`SponsorTier.astro` has `optimizeLogo()` that pipes bitmap logos through the CDN at 200×200 WebP. SVGs bypass it:

```ts
const optimizeLogo = (path: string) => {
  if (IS_DEV || path.endsWith('.svg')) return path;
  const p = new URLSearchParams({ url: path, format: 'webp', w: '200', h: '200' });
  return `/.netlify/images?${p}`;
};
```

### Sponsor Logo Flags

Each sponsor entry in `SPONSORS` can have:
- *(default)* — `brightness-0 invert` CSS filter → forces logo white
- `raw: true` — no filter; use for brand-colored logos (Red Bull, Kenda, Frito-Lay) or already-white logos
- `screen: true` — `invert mix-blend-screen`; use for logos on white backgrounds

### Converting AI Files to SVG

Use `pdftocairo` (via `brew install poppler`). AI files saved with PDF compatibility are PDF-based:

```bash
pdftocairo -svg -f 1 -l 1 "input.ai" "output"
mv output output.svg
```

For multi-artboard files, use `-f N -l N` for each page. After conversion:
- Strip any background `<rect>` elements
- Convert dark fills to `#ffffff` if the logo needs to be white
- Crop viewBox tight using coordinate min/max from path data
- Run `npx svgo --multipass` to optimize

### Adding New Photos

1. Drop file in `public/photos/` (~2400px originals)
2. Add key to `IMG` in frontmatter
3. Add `<PhotoCredit>` inside the section
4. Add to `GALLERY_PHOTOS` in `src/entrypoints/alpine.js` if it goes in the carousel

### OG Image

Absolute URL, JPG (not WebP):
```ts
const OG_IMAGE = `${SITE}/.netlify/images?url=/photos/poster.jpg&w=800&format=jpg&q=85`;
```

---

## Location Links

The `DateLocation` component uses a `geo:` URI for the location link:

```html
<a href="geo:45.7309,-122.303">Yacolt Burn, SW Washington</a>
```

- Opens native maps app on iOS/Android
- No `target="_blank"` or `rel` — `geo:` hands off to the OS, not a browser tab
- Coordinates match the JSON-LD `GeoCoordinates` block

---

## Panel Sections

Each `<Panel id="...">` automatically renders a section anchor-copy button (top-right corner, 20% opacity at rest). Clicking it copies `window.location.origin + '#id'` to the clipboard and briefly shows an amber checkmark. Only renders when `id` prop is present.

---

## Accessibility

- Skip link at top of `<body>` (`href="#experience"`)
- All modals: `role="dialog"`, `aria-modal="true"`, `aria-label`
- Modal buttons: explicit `aria-label` on close/prev/next
- FAQ accordion: `:aria-expanded="open.toString()"` on trigger buttons
- Gallery thumbnails: `loading="lazy" decoding="async"`
- Logo `<img>`: explicit `width`/`height` attributes to prevent CLS
- `[x-cloak] { display: none !important; }` in tailwind.css prevents Alpine flash

---

## JSON-LD Schema

Computed in frontmatter as `JSON_LD`, injected via `set:html`:

```astro
---
const JSON_LD = JSON.stringify({ '@context': 'https://schema.org', ... });
---
<script type="application/ld+json" set:html={JSON_LD} />
```

Never put Astro expressions inside `<script type="application/ld+json">{...}</script>` — Prettier will fail.

---

## Performance Notes

- `background-attachment: fixed` causes per-frame GPU repaints — use `bg-scroll` for panels that don't need parallax
- `content-visibility: auto` breaks IntersectionObserver — do not use
- `will-change-transform` on gallery thumbnails for smoother hover
- `decoding="async"` on all lazy-loaded images
- Reveal animations via `@utility reveal` in `tailwind.css` — desktop only (`min-width: 769px`), respects `prefers-reduced-motion`
- Sponsor SVGs optimized with `npx svgo --multipass`; bitmaps served at 200×200 via Netlify CDN

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
- Prettier hook is **disabled** — run manually after a batch of edits
- `temp/` is in `.gitignore` (or untracked) — use it for scratch AI/logo files
