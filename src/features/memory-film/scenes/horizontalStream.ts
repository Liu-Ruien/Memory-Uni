import type { StreamLayout } from '../utils/photoLayout'
import { filmMotion, organicStagger } from '../config/filmMotion'
import { addSceneLabel, crossfadeToResolvedLayout } from './sceneMotion'

interface HorizontalStreamSceneOptions {
  timeline: gsap.core.Timeline
  cards: HTMLElement[]
  outgoingCards?: HTMLElement[]
  label: HTMLElement | null
  layout: StreamLayout
  transitionStart: number
  transitionDuration: number
  motionDuration: number
  reducedMotion: boolean
}

export function addHorizontalStreamScene({
  timeline,
  cards,
  outgoingCards = [],
  label,
  layout,
  transitionStart,
  transitionDuration,
  motionDuration,
  reducedMotion,
}: HorizontalStreamSceneOptions) {
  if (outgoingCards.length > 0) {
    timeline.to(outgoingCards, reducedMotion ? {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.out',
    } : {
      opacity: 0,
      x: () => `-=${window.innerWidth * 0.52}`,
      rotation: (index: number) => `-=${1.6 + (index % 3) * 0.45}`,
      scale: 0.9,
      duration: Math.min(0.8, transitionDuration * 0.48),
      ease: filmMotion.ease.handoff,
    }, transitionStart)
  }

  addSceneLabel({
    timeline,
    label,
    enterAt: transitionStart + 0.18,
    exitAt: transitionStart + transitionDuration + motionDuration - filmMotion.label.leave - 0.04,
    reducedMotion,
  })

  if (reducedMotion) {
    crossfadeToResolvedLayout(timeline, cards, transitionStart, {
      x: (index: number) => layout.placements[index]?.x ?? 0,
      y: (index: number) => layout.placements[index]?.y ?? 0,
      z: 0,
      rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
      rotationX: 0,
      rotationY: 0,
      scale: (index: number) => layout.placements[index]?.scale ?? 1,
    })
  } else {
    timeline.to(cards, {
      x: (index: number) => layout.placements[index]?.x ?? 0,
      y: (index: number) => layout.placements[index]?.y ?? 0,
      z: (index: number) => layout.placements[index]?.z ?? 0,
      rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
      scale: (index: number) => layout.placements[index]?.scale ?? 1,
      opacity: 1,
      duration: Math.max(0.75, transitionDuration - 0.1),
      stagger: (index: number) => organicStagger(index, cards.length, 0.008),
      ease: filmMotion.ease.handoff,
    }, transitionStart)

    const motionStart = transitionStart + transitionDuration
    const accelerationDuration = motionDuration * 0.2
    const coastDuration = motionDuration * 0.54
    const decelerationDuration = motionDuration - accelerationDuration - coastDuration
    timeline.to(cards, {
      x: (index: number) => {
        const placement = layout.placements[index]
        return placement ? placement.x + (placement.endX - placement.x) * 0.16 : 0
      },
      y: (index: number) => (layout.placements[index]?.y ?? 0) * 0.88,
      rotation: (index: number) => (layout.placements[index]?.rotation ?? 0) * 0.82,
      duration: accelerationDuration,
      ease: 'power2.in',
    }, motionStart)
    timeline.to(cards, {
      x: (index: number) => {
        const placement = layout.placements[index]
        return placement ? placement.x + (placement.endX - placement.x) * 0.79 : 0
      },
      y: (index: number) => (layout.placements[index]?.y ?? 0) * 0.7 + ((index % 3) - 1) * 8,
      z: (index: number) => (layout.placements[index]?.z ?? 0) * 0.74,
      duration: coastDuration,
      ease: 'none',
    }, motionStart + accelerationDuration)
    timeline.to(cards, {
      x: (index: number) => layout.placements[index]?.endX ?? 0,
      y: (index: number) => (layout.placements[index]?.y ?? 0) * 0.55 + ((index % 3) - 1) * 12,
      z: (index: number) => (layout.placements[index]?.z ?? 0) * 0.62,
      rotation: (index: number) => (layout.placements[index]?.rotation ?? 0) * 0.5 + (index % 2 === 0 ? -1.2 : 1.2),
      duration: decelerationDuration,
      ease: 'power2.out',
    }, motionStart + accelerationDuration + coastDuration)
  }
}
