# Atmosphere continuity, accessibility, and performance

**Status:** Implemented  
**Priority:** P0  
**Scope:** `src/features/memory-film/components/MemoryFilmBackground.tsx`, `src/features/memory-film/memoryFilm.css`, all reduced-motion branches

## Audit finding

The canvas selects a different position formula as soon as the scene prop changes. A particle may be vertically drifting in one frame and be recomputed from a horizontal or radial formula in the next, producing spatial discontinuities. Scene energy also changes immediately. CSS glows ease smoothly, but the canvas layer does not. Reduced motion is present and structurally correct, yet some scene modules still run long opacity sequences and the intro/stage Framer transition does not currently consult the preference.

## Desired behavior

- Particles keep their current presentation position across chapter changes.
- Scene energy and directional drift interpolate continuously toward the new chapter rather than snapping.
- The atmosphere supports the photos: low energy at the wall, a lateral current in the stream, a gentle curl in the ring, radial pull in the tunnel, and near-stillness in text scenes.
- Reduced motion preserves all chapters, copy, archive, final message, replay, and exit while removing viewport-scale travel and orbit/tunnel movement.

## Implementation details

- Give each particle persistent normalized x/y state and update it incrementally from `deltaTime`.
- Interpolate an atmosphere vector/energy state with time-based damping, not frame-count-dependent lerp.
- Blend toward scene-specific velocity fields: vertical drift, lateral current, shallow rotation, radial expansion, and calm settling.
- Clamp delta time after tab/background pauses and wrap particles without sudden central respawns.
- Stop `requestAnimationFrame` entirely for reduced motion after one static render.
- Keep background work bounded to one canvas and compositor-friendly glow transforms; no extra full-screen filter animation.
- Extend reduced-motion CSS/Framer branches to the intro/stage handoff, chapter rail, paper sheets, and ending controls.

## Verification

- Record or inspect consecutive frames across every scene callback; dust cannot teleport.
- Background tab → foreground must not produce a large particle jump.
- With `prefers-reduced-motion: reduce`, the film reaches the ending and every chapter remains comprehensible.
- With `prefers-reduced-transparency: reduce` and `prefers-contrast: more`, functional surfaces remain legible and no motion relies on translucency alone.
