import type { FilmCardPlacement } from '../utils/photoLayout'
import { filmMotion, organicStagger } from '../config/filmMotion'
import { addSceneLabel, crossfadeToResolvedLayout } from './sceneMotion'

interface ScatterSceneOptions {
  timeline: gsap.core.Timeline
  cards: HTMLElement[]
  label: HTMLElement | null
  placements: FilmCardPlacement[]
  transitionStart: number
  transitionDuration: number
  holdDuration: number
  reducedMotion: boolean
}

export function addScatterScene({
  timeline,
  cards,
  label,
  placements,
  transitionStart,
  transitionDuration,
  holdDuration,
  reducedMotion,
}: ScatterSceneOptions) {
  addSceneLabel({
    timeline,
    label,
    enterAt: transitionStart + 0.18,
    exitAt: transitionStart + transitionDuration + holdDuration - filmMotion.label.leave - 0.04,
    reducedMotion,
  })

  if (reducedMotion) {
    crossfadeToResolvedLayout(timeline, cards, transitionStart, {
      x: (index: number) => placements[index]?.x ?? 0,
      y: (index: number) => placements[index]?.y ?? 0,
      z: 0,
      rotation: (index: number) => placements[index]?.rotation ?? 0,
      rotationX: 0,
      rotationY: 0,
      scale: (index: number) => placements[index]?.scale ?? 0.94,
    })
  } else {
    timeline.to(cards, {
      y: '+=5',
      z: '-=18',
      rotation: (index: number) => `+=${index % 2 === 0 ? -0.8 : 0.8}`,
      duration: 0.28,
      ease: 'power2.in',
    }, Math.max(0, transitionStart - 0.24))
    timeline.to(cards, {
      x: (index: number) => placements[index]?.x ?? 0,
      y: (index: number) => placements[index]?.y ?? 0,
      z: (index: number) => placements[index]?.z ?? 0,
      rotation: (index: number) => placements[index]?.rotation ?? 0,
      scale: (index: number) => placements[index]?.scale ?? 0.94,
      duration: Math.max(0.7, transitionDuration - 0.12),
      stagger: (index: number) => organicStagger(index, cards.length, 0.009),
      ease: filmMotion.ease.handoff,
    }, transitionStart)
  }
}
