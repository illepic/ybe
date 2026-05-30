---
name: workflow-rules
description: How to work in this project — commit behavior, dev server, formatting, CSS conventions
metadata:
  type: feedback
---

Do not commit or push without being explicitly asked.

Do not run `npm run dev` or start the dev server — user runs it themselves.

Do not run `npx astro build` after making changes — user has a dev server running and will verify changes themselves. Only build if explicitly asked or before a commit/push.

Prettier hook is disabled — run `npm run format` manually after a batch of edits, or when asked.

No ID selectors in CSS. BEM modifier classes only.

Keep BEM class names alongside Tailwind utilities for semantics and Alpine.js hooks.

**Why:** User runs their own dev server and build verification. Build commands after edits are unnecessary noise and slow the workflow.
