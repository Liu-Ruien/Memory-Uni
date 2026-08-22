import { filmMotion } from '../config/filmMotion'

interface SceneLabelOptions {
  timeline: gsap.core.Timeline
  label: HTMLElement | null
  enterAt: number
  exitAt: number
  reducedMotion: boolean
}

export function addSceneLabel({
  timeline,
  label,
  enterAt,
  exitAt,
  reducedMotion,
}: SceneLabelOptions) {
  if (!label) return

  timeline.fromTo(label, {
    opacity: 0,
    y: reducedMotion ? 0 : 9,
    clipPath: reducedMotion ? 'none' : 'inset(0 100% 0 0)',
    letterSpacing: reducedMotion ? '-0.02em' : '0.015em',
  }, {
    opacity: 1,
    y: 0,
    clipPath: reducedMotion ? 'none' : 'inset(0 0% 0 0)',
    letterSpacing: '-0.02em',
    duration: reducedMotion ? 0.2 : filmMotion.label.enter,
    ease: filmMotion.ease.enter,
  }, enterAt)

  timeline.to(label, {
    opacity: 0,
    y: reducedMotion ? 0 : -7,
    clipPath: reducedMotion ? 'none' : 'inset(0 0 0 12%)',
    duration: reducedMotion ? 0.2 : filmMotion.label.leave,
    ease: filmMotion.ease.leave,
  }, exitAt)
}

export function crossfadeToResolvedLayout(
  timeline: gsap.core.Timeline,
  cards: HTMLElement[],
  at: number,
  resolvedState: gsap.TweenVars,
  opacity = 1,
) {
  timeline.to(cards, {
    opacity: 0,
    duration: filmMotion.crossfade.out,
    ease: 'power2.out',
  }, at)
  timeline.set(cards, resolvedState, at + filmMotion.crossfade.out)
  timeline.to(cards, {
    opacity,
    duration: filmMotion.crossfade.in,
    ease: filmMotion.ease.ui,
  }, at + filmMotion.crossfade.out)
}
