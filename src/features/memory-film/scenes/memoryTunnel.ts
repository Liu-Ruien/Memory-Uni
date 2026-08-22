import type { TunnelCardPlacement } from '../utils/photoLayout'
import { filmMotion, organicStagger } from '../config/filmMotion'
import { crossfadeToResolvedLayout } from './sceneMotion'

interface MemoryTunnelSceneOptions {
  timeline: gsap.core.Timeline
  cards: HTMLElement[]
  outgoingCards: HTMLElement[]
  placements: TunnelCardPlacement[]
  transitionStart: number
  transitionDuration: number
  travelDuration: number
  reducedMotion: boolean
}

export function addMemoryTunnelScene({
  timeline,
  cards,
  outgoingCards,
  placements,
  transitionStart,
  transitionDuration,
  travelDuration,
  reducedMotion,
}: MemoryTunnelSceneOptions) {
  if (outgoingCards.length > 0) {
    timeline.to(outgoingCards, reducedMotion ? {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.out',
    } : {
      opacity: 0,
      z: '-=120',
      scale: 0.74,
      duration: transitionDuration * 0.6,
      ease: filmMotion.ease.handoff,
    }, transitionStart)
  }

  if (reducedMotion) {
    crossfadeToResolvedLayout(timeline, cards, transitionStart, {
      x: (index: number) => (placements[index]?.endX ?? 0) * 0.42,
      y: (index: number) => (placements[index]?.endY ?? 0) * 0.42,
      z: 0,
      rotation: (index: number) => (placements[index]?.rotation ?? 0) * 0.5,
      rotationX: 0,
      rotationY: 0,
      scale: (index: number) => Math.max(0.72, (placements[index]?.endScale ?? 1) * 0.46),
    }, 0.78)
    return
  }

  timeline.to(cards, {
    x: (index: number) => placements[index]?.x ?? 0,
    y: (index: number) => placements[index]?.y ?? 0,
    z: (index: number) => placements[index]?.z ?? -600,
    rotation: (index: number) => placements[index]?.rotation ?? 0,
    rotationY: 0,
    scale: (index: number) => placements[index]?.scale ?? 0.55,
    opacity: (index: number) => 0.2 + (index % 3) * 0.06,
    duration: transitionDuration,
    stagger: (index: number) => organicStagger(cards.length - index - 1, cards.length, 0.008),
    ease: filmMotion.ease.handoff,
  }, transitionStart)

  const travelStart = transitionStart + transitionDuration
  const waveCount = Math.max(1, ...placements.map((placement) => placement.wave + 1))
  const approachDuration = Math.min(reducedMotion ? 0.5 : 3, travelDuration * 0.48)
  const exitDuration = Math.min(0.72, travelDuration * 0.12)
  const waveStep = waveCount > 1
    ? Math.max(0.42, (travelDuration - approachDuration - exitDuration) / (waveCount - 1))
    : 0

  cards.forEach((card, index) => {
    const placement = placements[index]
    if (!placement) return
    const start = travelStart + placement.wave * waveStep + placement.waveOrder * 0.055
    timeline.to(card, {
      x: placement.endX,
      y: placement.endY,
      z: placement.endZ,
      rotation: placement.rotation * 0.35,
      scale: placement.endScale,
      opacity: 1,
      duration: approachDuration,
      ease: 'power2.in',
    }, start)
    timeline.to(card, {
      x: placement.endX * 1.12,
      y: placement.endY * 1.1,
      z: placement.endZ + 140,
      scale: placement.endScale * 1.06,
      opacity: 0,
      duration: exitDuration,
      ease: 'power2.in',
    }, start + approachDuration - 0.08)
  })
}
