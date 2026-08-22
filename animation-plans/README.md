# Memory Film animation audit

Baseline commit: `75ed8f0`

The existing film already has the correct product architecture: a single GSAP timeline, a single set of real photo elements, seven chapters, audio/fullscreen/replay, and a reduced-motion branch. The redesign therefore keeps the visual composition and rewrites the motion system around one thesis:

> The same sheet of photographic paper is handed from one chapter to the next. Its position, depth, and velocity remain continuous; the camera breathes around that handoff; interface chrome responds immediately and then gets out of the way.

## Priority order

| Priority | Plan | Why it matters |
| --- | --- | --- |
| P0 | [001 — Continuous scene handoffs](./001-continuous-scene-handoffs.md) | Removes the visible “seven animations stitched together” feeling. |
| P0 | [002 — Photo physicality and camera](./002-photo-physicality-and-camera.md) | Gives every chapter a distinct spatial verb without losing one film-wide rhythm. |
| P1 | [003 — Editorial text and HUD feedback](./003-editorial-text-and-hud-feedback.md) | Makes chapter state, archive, letters, and ending feel authored rather than generically faded. |
| P0 | [004 — Atmospheric continuity and accessibility](./004-atmosphere-accessibility-performance.md) | Prevents particle teleports, protects performance, and preserves the complete story for reduced motion. |

## Motion budget

- One focal event per chapter; never animate every layer at equal emphasis.
- Scene choreography uses `transform` and `opacity`; bounded blur is reserved for a single editorial surface at a seam, not all photos.
- UI feedback stays within roughly 120–300ms. Cinematic chapter travel may run for seconds because it is the experience itself.
- Photo cards preserve identity across scenes. Hidden/dormant cards enter from a spatially plausible edge; no unrelated reset flash.
- Reduced motion keeps all seven chapters and the ending, replacing 3D travel with short cross-fades and static resolved compositions.

