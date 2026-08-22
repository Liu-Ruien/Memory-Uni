# Continuous scene handoffs

**Status:** Implemented  
**Priority:** P0  
**Scope:** `src/features/memory-film/components/FilmStage.tsx`, all files in `src/features/memory-film/scenes/`

## Audit finding

The page reuses the same photo DOM nodes, but several chapter seams still read as resets:

- `scatter.ts` and `horizontalStream.ts` use nearly identical centered staggers and `power3.inOut`, so two different narrative ideas share the same gesture.
- `horizontalStream.ts` moves for 8.2 seconds with `ease: 'none'`; it reads as a conveyor belt and then stops at the ring boundary.
- `memoryRing.ts` animates the outer cards around the ring, then overwrites those same transforms for hero zooms. With `overwrite: 'auto'`, the live orbit and hero focus can lose velocity continuity.
- `memoryTunnel.ts` fades every card to zero at the end of its pass. `finalGathering.ts` then resolves the same nodes to a new formation, but dormant nodes are hard-set at the chapter boundary.

## Desired behavior

Treat chapter boundaries as handoffs rather than cuts:

1. **Wall → scatter:** the wall releases from the center outward. Rotation and depth lag slightly behind position, like paper losing alignment.
2. **Scatter → stream:** photos agree on one direction before accelerating; outgoing cards leave in that same direction instead of alternating left/right.
3. **Stream → ring:** the stream decelerates into curvature. Cards retain their current outer transforms; hero emphasis animates the inner photo surface, never interrupts the orbit transform.
4. **Ring → tunnel:** depth collapses toward the vanishing point before individual waves pass the camera.
5. **Tunnel → gathering:** passed cards remain spatially “beyond” the camera and arc back toward a shared formation. Dormant cards are staged before the boundary and join from the periphery.
6. **Gathering → text:** the photo formation dissolves center-out with a small depth release, leaving a calm central aperture for the era title.

## Implementation details

- Add named film motion constants/helpers for transition ease, settle ease, drift ease, UI ease, and directional stagger.
- Replace generic centered staggers with spatial order derived from target x/depth or existing layout order.
- Split horizontal travel into accelerate/coast/decelerate segments; no fully linear eight-second movement.
- Query each ring card’s `.memory-film-photo-surface` and animate that inner surface for focal emphasis while the outer card continues its orbit.
- Stage dormant gathering cards slightly before the gathering boundary, then use a restrained two-step settle (near-target → exact target) to encode momentum without a decorative bounce.
- Keep all timeline operations on the master timeline so replay, dev time scaling, callbacks, and teardown remain deterministic.

## Verification

- Capture frames immediately before and after every chapter boundary at normal speed and `?filmSpeed=6`; no card may teleport to an unrelated origin.
- The ring’s focal photos must continue orbiting without snapping when emphasis ends.
- The stream visibly accelerates and eases into the ring rather than moving at a constant rate and stopping.
- Replay must produce exactly the same formations and chapter timing.
