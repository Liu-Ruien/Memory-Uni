# Editorial text and HUD feedback

**Status:** Implemented  
**Priority:** P1  
**Scope:** `src/features/memory-film/scenes/filmTextScenes.ts`, `src/features/memory-film/components/FilmStage.tsx`, `src/features/memory-film/memoryFilm.css`, intro/stage transition in `MemoryFilmPage.tsx`

## Audit finding

Most non-photo elements use the same fade/up/blur recipe. The archive enters as one block, every letter uses identical timing, the final message only changes opacity, and the ending UI appears as one layer. The HUD changes color for the current chapter but does not communicate completed/upcoming states or a physical handoff between chapters. Intro → stage is an opacity-only `mode="wait"` transition, which breaks the approved promise that the photo gate becomes the first wall.

## Desired behavior

- **Intro → stage:** overlap the two views. The photo gate eases forward and softens while the first wall resolves behind it, reading as a camera pass through the gate rather than a page swap.
- **Chapter rail:** current chapter materializes immediately; completed chapters remain legible but quiet; upcoming chapters recede. The active locator moves/settles without a glow pulse loop.
- **Scene labels:** reveal through a short masked line and small tracking correction, then leave along the same vertical path.
- **Archive:** the glass archive surface materializes first, then header, four rows, and closing sentence resolve in reading order.
- **Letters:** each sheet enters from depth with a slight alternating paper angle and exits upward along a mirrored page-turn path. No repeated generic blur-and-rise.
- **Final message and ending:** reveal line groups and actions in semantic order; ending controls become interactive at the first visible frame.

## Implementation details

- Use Framer Motion’s reduced-motion signal for the intro/stage overlap; reduced motion gets a short opacity cross-fade only.
- Add chapter refs or deterministic `data-state="complete|active|upcoming"` markers in the timeline callback; animate only transform/color/opacity.
- Query archive descendants and ending descendants inside the existing GSAP context; timeline them in semantic reading order.
- Give letter sheets alternating `rotationZ` of roughly ±1° and restrained `rotationX`; reset exact transforms on exit to keep replay deterministic.
- Keep UI press feedback immediate through the existing button component; cinematic delay never blocks the exit or replay controls.

## Verification

- Click Start with a mouse and keyboard; feedback is immediate and no blank frame appears between intro and stage.
- At each boundary, rail states match the visual scene and elapsed time.
- Archive content is readable as it arrives; it is not moving continuously while the user needs to read it.
- Ending buttons are focusable/clickable as soon as visible; replay restores the full intro-free film timeline correctly.
