---
name: share-button-placement
description: Share button placement is temporary — user wants to revisit, likely moving it to the Nav component
metadata:
  type: project
---

Share button is currently placed in the hero section beneath the countdown. User wants to revisit placement and is considering moving it into the Nav component instead.

**Why:** Current placement feels off. Nav is a more prominent, persistent location.
**How to apply:** When revisiting, check Nav.astro and consider adding `x-data="shareBtn" @click="share()"` alongside the Register button in the nav. The `shareBtn` Alpine component is already registered in `src/entrypoints/alpine.js`.
