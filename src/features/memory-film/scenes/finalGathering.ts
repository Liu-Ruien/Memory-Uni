import type { GatheringLayout } from '../utils/photoLayout'
import { filmMotion } from '../config/filmMotion'

interface FinalGatheringSceneOptions {
  timeline: gsap.core.Timeline
  cards: HTMLElement[]
  dormantCards: HTMLElement[]
  layout: GatheringLayout
  baseCardWidth: number
  title: HTMLElement | null
  transitionStart: number
  transitionDuration: number
  holdDuration: number
  reducedMotion: boolean
}

export function addFinalGatheringScene({
  timeline,
  cards,
  dormantCards,
  layout,
  baseCardWidth,
  title,
  transitionStart,
  transitionDuration,
  holdDuration,
  reducedMotion,
}: FinalGatheringSceneOptions) {
  const relayCards = cards.filter((_, index) => layout.placements[index]?.visibleInFinal === false)
  if (dormantCards.length > 0) {
    timeline.set(dormantCards, {
      x: (index: number) => (index % 2 === 0 ? -1 : 1) * layout.metrics.width * (0.42 + (index % 3) * 0.025),
      y: (index: number) => ((index % 5) - 2) * layout.metrics.height * 0.16,
      z: -220,
      rotation: (index: number) => (index % 2 === 0 ? -1 : 1) * (4 + index % 5),
      rotationY: 0,
      scale: 0.7,
      opacity: 0,
    }, Math.max(0, transitionStart - 0.28))
  }

  if (relayCards.length > 0 && !reducedMotion) {
    timeline.to(relayCards, {
      opacity: 0.34,
      duration: transitionDuration * 0.34,
      stagger: { each: 0.018, from: 'edges' },
      ease: filmMotion.ease.ui,
    }, transitionStart)
  }

  const settleStart = relayCards.length > 0 && !reducedMotion
    ? transitionStart + transitionDuration * 0.22
    : transitionStart
  const settleDuration = relayCards.length > 0 && !reducedMotion
    ? transitionDuration * 0.78
    : transitionDuration

  if (reducedMotion) {
    timeline.to(cards, { opacity: 0, duration: 0.18, ease: 'power2.out' }, settleStart)
    timeline.set(cards, {
      x: (index: number) => layout.placements[index]?.x ?? 0,
      y: (index: number) => layout.placements[index]?.y ?? 0,
      z: 0,
      rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
      rotationX: 0,
      rotationY: 0,
      scale: (index: number) => layout.placements[index]?.scale ?? layout.metrics.cardWidth / Math.max(1, baseCardWidth),
    }, settleStart + 0.18)
    timeline.to(cards, {
      opacity: (index: number) => layout.placements[index]?.opacity ?? 0.72,
      duration: 0.26,
      ease: filmMotion.ease.ui,
    }, settleStart + 0.18)
  } else {
    const approachDuration = settleDuration * 0.74
    const settleFinishDuration = settleDuration - approachDuration
    timeline.to(cards, {
      x: (index: number) => (layout.placements[index]?.x ?? 0) * 1.035,
      y: (index: number) => (layout.placements[index]?.y ?? 0) * 1.035,
      z: (index: number) => (layout.placements[index]?.z ?? 0) + 26,
      rotation: (index: number) => (layout.placements[index]?.rotation ?? 0) * 1.18,
      rotationY: 0,
      scale: (index: number) => (layout.placements[index]?.scale ?? 1) * 0.965,
      opacity: (index: number) => Math.max(0.18, (layout.placements[index]?.opacity ?? 0.72) * 0.9),
      duration: approachDuration,
      stagger: { each: 0.01, from: 'edges' },
      ease: filmMotion.ease.handoff,
    }, settleStart)
    timeline.to(cards, {
      x: (index: number) => layout.placements[index]?.x ?? 0,
      y: (index: number) => layout.placements[index]?.y ?? 0,
      z: (index: number) => layout.placements[index]?.z ?? 0,
      rotation: (index: number) => layout.placements[index]?.rotation ?? 0,
      scale: (index: number) => layout.placements[index]?.scale ?? layout.metrics.cardWidth / Math.max(1, baseCardWidth),
      opacity: (index: number) => layout.placements[index]?.opacity ?? 0.72,
      duration: Math.max(0.42, settleFinishDuration),
      stagger: { each: 0.006, from: 'edges' },
      ease: filmMotion.ease.settle,
    }, settleStart + approachDuration)
  }

  if (title) {
    timeline.fromTo(title, {
      opacity: 0,
      y: reducedMotion ? 0 : 10,
      scale: 0.97,
      letterSpacing: '0.04em',
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      letterSpacing: '0.09em',
      duration: reducedMotion ? 0.3 : 0.78,
      ease: filmMotion.ease.enter,
    }, transitionStart + Math.min(transitionDuration * 0.68, transitionDuration - 0.35))
    timeline.to(title, {
      opacity: 0,
      y: reducedMotion ? 0 : -8,
      duration: reducedMotion ? 0.22 : 0.52,
      ease: filmMotion.ease.leave,
    }, transitionStart + transitionDuration + holdDuration - 0.55)
  }
}
