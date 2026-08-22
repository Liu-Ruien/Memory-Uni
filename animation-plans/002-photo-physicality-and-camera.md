# Photo physicality and camera choreography

**Status:** Implemented  
**Priority:** P0  
**Scope:** `src/features/memory-film/components/FilmStage.tsx`, `src/features/memory-film/utils/photoLayout.ts`, photo scene modules

## Audit finding

The current camera plane only changes scale/z and uses variants of the same `power2/3.inOut` curve. The photos have 3D coordinates, but the camera rarely communicates why those coordinates changed. The final gathering also applies a uniform 1.5% scale “breath” to every card, which feels like a generic pulse rather than paper settling.

## Motion thesis

The camera behaves like a quiet human observer around a proof table:

- it leans in when a shared detail matters;
- it gives space when the photos scatter;
- it tracks the flow without competing with it;
- it is pulled forward by the tunnel;
- it becomes still when everyone returns to one place.

## Camera score

| Chapter | Camera verb | Photo verb | Energy |
| --- | --- | --- | --- |
| 01 共同校样 | slow lean-in | center-out resolve | low |
| 02 散落片段 | small pullback + off-axis drift | release | medium |
| 03 时间向前 | lateral counter-drift | accelerate, coast, decelerate | medium-high |
| 04 重新相遇 | shallow arc | orbit with local inner-surface focus | high but graceful |
| 05 穿过四年 | forward draw | depth waves past camera | peak |
| 06 重回一处 | critically damped settle | perimeter-to-center assembly | falling |
| 07 写给我们 | camera still | physical paper/editorial transitions | calm |

## Implementation details

- Initialize the plane slightly behind the resolved wall, then animate full transform strings/explicit transform properties to avoid partial-transform conflicts.
- Add tiny x/y/rotationZ offsets only where they clarify the chapter direction; keep values optically small so faces and edges remain stable.
- Keep camera transitions overlapping the corresponding photo transition, with complementary direction rather than identical motion.
- Remove the uniform final-card pulse. The settling motion belongs in the gathering transition itself.
- Add `force3D`/compositor hints only to elements that actually animate; do not promote the entire page.
- Do not distort image aspect ratios or use large blur on moving full-screen content.

## Verification

- Watch once with HUD hidden: every chapter must still have a distinct verb.
- Watch once focused on a single recognizable photo: it should maintain identity through the wall, flow/ring/tunnel subsets, and final assembly.
- Check 1440×900 and 1920×1080; camera offsets must not push hero faces under HUD safe areas.
- Use browser performance traces or frame stability checks around ring/tunnel; no persistent layout/paint animation.
