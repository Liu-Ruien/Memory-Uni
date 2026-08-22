import type { FilmLayout } from '../utils/photoLayout'
import { filmMotion } from '../config/filmMotion'
import { addSceneLabel } from './sceneMotion'

interface PhotoWallSceneOptions {
  timeline: gsap.core.Timeline
  cards: HTMLElement[]
  label: HTMLElement | null
  layout: FilmLayout
  startAt: number
  entranceDuration: number
  holdDuration: number
  reducedMotion: boolean
}

export function addPhotoWallScene({
  timeline,
  cards,
  label,
  layout,
  startAt,
  entranceDuration,
  holdDuration,
  reducedMotion,
}: PhotoWallSceneOptions) {
  const revealRank = new Map(layout.revealOrder.map((cardIndex, rank) => [cardIndex, rank]))

  timeline.set(cards, {
    width: layout.metrics.cardWidth,
    x: (index: number) => layout.placements[index]?.x ?? 0,
    y: (index: number) => (layout.placements[index]?.y ?? 0) + (reducedMotion ? 0 : 18),
    z: (index: number) => (layout.placements[index]?.z ?? 0) - (reducedMotion ? 0 : 120),
    rotation: (index: number) => (layout.placements[index]?.rotation ?? 0) * (reducedMotion ? 1 : 1.6),
    rotationX: reducedMotion ? 0 : -2.4,
    rotationY: 0,
    scale: (index: number) => (layout.placements[index]?.scale ?? 1) * (reducedMotion ? 1 : 0.84),
    opacity: 0,
    transformPerspective: 1400,
    force3D: true,
  }, startAt)

  addSceneLabel({
    timeline,
    label,
    enterAt: startAt + 0.12,
    exitAt: startAt + entranceDuration + holdDuration - filmMotion.label.leave - 0.04,
    reducedMotion,
  })

  timeline.to(cards, {
    y: (index: number) => layout.placements[index]?.y ?? 0,
    z: (index: number) => layout.placements[index]?.z ?? 0,
    rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
    rotationX: 0,
    opacity: 1,
    scale: (index: number) => layout.placements[index]?.scale ?? 1,
    duration: reducedMotion ? 0.25 : 0.78,
    stagger: reducedMotion ? 0 : (index: number) => (revealRank.get(index) ?? index) * 0.034,
    ease: filmMotion.ease.enter,
  }, startAt + 0.06)
}
