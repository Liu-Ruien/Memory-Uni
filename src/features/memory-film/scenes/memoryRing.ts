import type { RingLayout } from '../utils/photoLayout'
import { filmMotion, organicStagger } from '../config/filmMotion'
import { crossfadeToResolvedLayout } from './sceneMotion'

interface MemoryRingSceneOptions {
  timeline: gsap.core.Timeline
  cards: HTMLElement[]
  outgoingCards: HTMLElement[]
  layout: RingLayout
  baseCardWidth: number
  transitionStart: number
  transitionDuration: number
  orbitDuration: number
  reducedMotion: boolean
}

export function addMemoryRingScene({
  timeline,
  cards,
  outgoingCards,
  layout,
  baseCardWidth,
  transitionStart,
  transitionDuration,
  orbitDuration,
  reducedMotion,
}: MemoryRingSceneOptions) {
  if (outgoingCards.length > 0) {
    timeline.to(outgoingCards, reducedMotion ? {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.out',
    } : {
      opacity: 0,
      z: '-=90',
      scale: 0.78,
      duration: transitionDuration * 0.55,
      ease: filmMotion.ease.handoff,
    }, transitionStart)
  }

  if (reducedMotion) {
    crossfadeToResolvedLayout(timeline, cards, transitionStart, {
      x: (index: number) => layout.placements[index]?.x ?? 0,
      y: (index: number) => layout.placements[index]?.y ?? 0,
      z: 0,
      rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
      rotationX: 0,
      rotationY: 0,
      scale: (index: number) => layout.placements[index]?.scale ?? 0.82,
    }, 0.88)
    return
  }

  timeline.to(cards, {
    x: (index: number) => layout.placements[index]?.x ?? 0,
    y: (index: number) => layout.placements[index]?.y ?? 0,
    z: (index: number) => layout.placements[index]?.z ?? 0,
    rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
    rotationY: (index: number) => layout.placements[index]?.rotationY ?? 0,
    scale: (index: number) => layout.placements[index]?.scale ?? 0.82,
    opacity: (index: number) => layout.placements[index]?.opacity ?? 0.8,
    duration: transitionDuration,
    stagger: (index: number) => organicStagger(index, cards.length, 0.01),
    ease: filmMotion.ease.handoff,
  }, transitionStart)

  const orbitStart = transitionStart + transitionDuration
  timeline.to(cards, {
    x: (index: number) => layout.rotatedPlacements[index]?.x ?? 0,
    y: (index: number) => layout.rotatedPlacements[index]?.y ?? 0,
    z: (index: number) => layout.rotatedPlacements[index]?.z ?? 0,
    rotation: (index: number) => layout.rotatedPlacements[index]?.rotation ?? 0,
    rotationY: (index: number) => layout.rotatedPlacements[index]?.rotationY ?? 0,
    scale: (index: number) => layout.rotatedPlacements[index]?.scale ?? 0.82,
    opacity: (index: number) => layout.rotatedPlacements[index]?.opacity ?? 0.8,
    duration: orbitDuration,
    ease: filmMotion.ease.drift,
  }, orbitStart)

  const heroCount = Math.min(3, cards.length)
  const heroSlice = orbitDuration / Math.max(1, heroCount)
  const surfaces = cards
    .map((card) => card.querySelector<HTMLElement>('.memory-film-photo-surface'))
    .filter((surface): surface is HTMLElement => Boolean(surface))
  const heroScale = Math.min(1.11, Math.max(1.045, layout.heroWidth / Math.max(1, baseCardWidth) * 0.34))
  for (let heroIndex = 0; heroIndex < heroCount; heroIndex += 1) {
    const cardIndex = Math.floor(((heroIndex + 0.62) * cards.length) / Math.max(1, heroCount)) % cards.length
    const surface = cards[cardIndex]?.querySelector<HTMLElement>('.memory-film-photo-surface')
    if (!surface) continue
    const start = orbitStart + 0.12 + heroIndex * heroSlice
    const enterDuration = Math.min(0.66, heroSlice * 0.28)
    const holdDuration = Math.min(1.2, heroSlice * 0.46)
    const returnDuration = Math.min(0.6, heroSlice * 0.26)

    timeline.to(surfaces, {
      opacity: (index: number) => index === cardIndex ? 1 : 0.62,
      duration: 0.36,
      ease: filmMotion.ease.ui,
    }, start)
    timeline.to(surface, {
      scale: heroScale,
      duration: enterDuration,
      ease: filmMotion.ease.enter,
    }, start)
    timeline.to(surface, {
      scale: 1,
      duration: returnDuration,
      ease: filmMotion.ease.handoff,
    }, start + enterDuration + holdDuration)
    timeline.to(surfaces, {
      opacity: 1,
      duration: 0.36,
      ease: filmMotion.ease.ui,
    }, start + enterDuration + holdDuration)
  }
}
