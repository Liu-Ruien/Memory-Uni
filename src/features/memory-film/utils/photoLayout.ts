import type { Photo } from '../../../data/photos'
import { createSceneVisualScale, type SceneVisualScale } from '../config/sceneVisualScale'

export interface FilmCardPlacement {
  x: number
  y: number
  z: number
  rotation: number
  scale: number
}

export interface FilmLayoutMetrics {
  width: number
  height: number
  cardWidth: number
  cardHeight: number
  isMobile: boolean
  visualScale: SceneVisualScale
}

export interface FilmLayout {
  metrics: FilmLayoutMetrics
  placements: FilmCardPlacement[]
  columns: number
  rows: number
  revealOrder: number[]
}

export interface StreamCardPlacement extends FilmCardPlacement {
  endX: number
  lane: number
  speed: number
}

export interface StreamLayout {
  placements: StreamCardPlacement[]
  laneCount: number
  visibleCount: number
  cardWidth: number
}

export interface RingCardPlacement extends FilmCardPlacement {
  rotationY: number
  opacity: number
}

export interface RingLayout {
  placements: RingCardPlacement[]
  rotatedPlacements: RingCardPlacement[]
  radiusX: number
  radiusY: number
  heroWidth: number
}

export interface TunnelCardPlacement extends FilmCardPlacement {
  endX: number
  endY: number
  endZ: number
  endScale: number
  wave: number
  waveOrder: number
}

export type GatheringTier = 'hero' | 'middle' | 'background'

export interface GatheringCardPlacement extends FilmCardPlacement {
  opacity: number
  tier: GatheringTier
  visibleInFinal: boolean
}

export interface GatheringLayout {
  metrics: FilmLayoutMetrics
  placements: GatheringCardPlacement[]
  columns: number
  rows: number
  usesTitleOverlay: boolean
  tierCounts: Record<GatheringTier, number>
}

function chronologicalTimestamp(photo: Photo) {
  const value = photo.takenAt ?? photo.uploadedAt
  if (!value) return Number.MAX_SAFE_INTEGER
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER
}

export function sortPhotosChronologically(photos: Photo[]) {
  return [...photos].sort((a, b) => chronologicalTimestamp(a) - chronologicalTimestamp(b))
}

function rowCountsForWall(count: number, isMobile: boolean) {
  if (count <= 0) return []
  if (isMobile) {
    if (count <= 4) return [count]
    if (count <= 7) return [Math.ceil(count / 2), Math.floor(count / 2)]
    const middle = Math.min(4, count - 4)
    return [Math.ceil((count - middle) / 2), middle, Math.floor((count - middle) / 2)]
      .filter(Boolean)
  }
  if (count <= 7) return [count]
  if (count <= 14) return [Math.ceil(count / 2), Math.floor(count / 2)]
  const first = Math.ceil(count / 3)
  const second = Math.ceil((count - first) / 2)
  return [first, second, count - first - second]
}

export function getPhotoWallColumns(count: number, isMobile: boolean) {
  return Math.max(1, ...rowCountsForWall(count, isMobile))
}

export function orderPhotosForPreload(photos: Photo[], isMobile: boolean) {
  const rows = rowCountsForWall(photos.length, isMobile)
  const positions: Array<{ photo: Photo; index: number; distance: number }> = []
  let sourceIndex = 0
  rows.forEach((rowCount, row) => {
    for (let column = 0; column < rowCount; column += 1) {
      const index = sourceIndex
      positions.push({
        photo: photos[index],
        index,
        distance: Math.hypot(column - (rowCount - 1) / 2, (row - (rows.length - 1) / 2) * 1.18),
      })
      sourceIndex += 1
    }
  })
  return positions
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map(({ photo }) => photo)
}

function signedNoise(index: number, offset: number) {
  const value = Math.sin((index + 1) * 12.9898 + offset * 78.233) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

function createMetrics(width: number, height: number, count: number): FilmLayoutMetrics {
  const isMobile = width < 720
  const visualScale = createSceneVisualScale(width, height, isMobile)
  const columns = getPhotoWallColumns(count, isMobile)
  const gap = isMobile ? 10 : Math.min(28, Math.max(18, width * 0.0125))
  const maxWidth = Math.max(220, width - (isMobile ? 28 : 108))
  const widthFit = (maxWidth - gap * Math.max(0, columns - 1)) / columns
  const cardWidth = Math.max(isMobile ? 58 : 112, Math.min(visualScale.wallWidth, widthFit))
  return {
    width,
    height,
    cardWidth,
    cardHeight: cardWidth * (4 / 3),
    isMobile,
    visualScale,
  }
}

export function createPhotoWallLayout(width: number, height: number, count: number): FilmLayout {
  const metrics = createMetrics(width, height, count)
  const rowCounts = rowCountsForWall(count, metrics.isMobile)
  const columns = Math.max(1, ...rowCounts)
  const rows = rowCounts.length
  const gapX = metrics.isMobile ? 9 : Math.min(28, Math.max(18, width * 0.0125))
  const gapY = metrics.isMobile ? 8 : Math.min(20, Math.max(12, height * 0.017))
  const rowStep = metrics.cardHeight + gapY
  const contentHeight = rows * metrics.cardHeight + Math.max(0, rows - 1) * gapY
  const placements: FilmCardPlacement[] = []
  const revealDistance: Array<{ index: number; distance: number }> = []
  let sourceIndex = 0

  rowCounts.forEach((rowCount, row) => {
    const rowWidth = rowCount * metrics.cardWidth + Math.max(0, rowCount - 1) * gapX
    for (let column = 0; column < rowCount; column += 1) {
      const index = sourceIndex
      const baseX = -rowWidth / 2 + metrics.cardWidth / 2 + column * (metrics.cardWidth + gapX)
      const baseY = -contentHeight / 2 + metrics.cardHeight / 2 + row * rowStep
      const xJitter = signedNoise(index, 18) * (metrics.isMobile ? 3 : 8)
      const yJitter = signedNoise(index, 19) * (metrics.isMobile ? 7 : 12)
      placements.push({
        x: baseX + xJitter,
        y: baseY + yJitter,
        z: signedNoise(index, 20) * (metrics.isMobile ? 8 : 26),
        rotation: signedNoise(index, 21) * (metrics.isMobile ? 1.8 : 2.5),
        scale: 1 + signedNoise(index, 22) * 0.025,
      })
      revealDistance.push({
        index,
        distance: Math.hypot(baseX / Math.max(1, width), baseY / Math.max(1, height)),
      })
      sourceIndex += 1
    }
  })

  return {
    metrics,
    placements,
    columns,
    rows,
    revealOrder: revealDistance.sort((a, b) => a.distance - b.distance || a.index - b.index).map(({ index }) => index),
  }
}

export function createScatterLayout(metrics: FilmLayoutMetrics, count: number): FilmCardPlacement[] {
  const source = createPhotoWallLayout(metrics.width, metrics.height, count).placements
  const xLimit = metrics.width * (metrics.isMobile ? 0.4 : 0.43)
  const yLimit = metrics.height * (metrics.isMobile ? 0.34 : 0.39)
  return source.map((placement, index) => ({
    x: Math.max(-xLimit, Math.min(xLimit, placement.x * (metrics.isMobile ? 1.04 : 1.14) + signedNoise(index, 31) * (metrics.isMobile ? 16 : 42))),
    y: Math.max(-yLimit, Math.min(yLimit, placement.y * 0.93 + signedNoise(index, 32) * (metrics.isMobile ? 24 : 52))),
    z: signedNoise(index, 33) * (metrics.isMobile ? 70 : 190),
    rotation: placement.rotation + signedNoise(index, 34) * (metrics.isMobile ? 5 : 9),
    scale: Math.max(0.82, Math.min(1.13, 0.97 + signedNoise(index, 35) * (metrics.isMobile ? 0.08 : 0.15))),
  }))
}

export function createHorizontalStreamLayout(metrics: FilmLayoutMetrics, count: number): StreamLayout {
  const cardWidth = metrics.visualScale.ribbonWidth
  const scale = cardWidth / metrics.cardWidth
  const step = cardWidth * (metrics.isMobile ? 0.91 : 0.89)
  const trackWidth = Math.max(0, count - 1) * step
  const travel = Math.max(metrics.width * 0.78, step * (metrics.isMobile ? 4.5 : 7))
  const placements = Array.from({ length: count }, (_, index): StreamCardPlacement => {
    const x = -trackWidth / 2 + index * step
    return {
      x,
      y: signedNoise(index, 41) * (metrics.isMobile ? 18 : 29),
      z: signedNoise(index, 42) * (metrics.isMobile ? 24 : 72),
      rotation: signedNoise(index, 43) * (metrics.isMobile ? 2 : 3),
      scale: scale * (1 + signedNoise(index, 44) * 0.035),
      endX: x - travel,
      lane: 0,
      speed: 1,
    }
  })

  return {
    placements,
    laneCount: 1,
    visibleCount: Math.min(count, metrics.isMobile ? 8 : 11),
    cardWidth,
  }
}

function createRingPlacements(metrics: FilmLayoutMetrics, count: number, rotationDegrees: number) {
  const radiusX = Math.min(metrics.width * (metrics.isMobile ? 0.31 : 0.37), metrics.isMobile ? 126 : 720)
  const radiusY = Math.min(metrics.height * (metrics.isMobile ? 0.18 : 0.22), metrics.isMobile ? 148 : 260)
  const depth = Math.min(metrics.width * (metrics.isMobile ? 0.19 : 0.29), metrics.isMobile ? 120 : 560)
  const rotation = (rotationDegrees * Math.PI) / 180
  const baseScale = metrics.visualScale.ringWidth / metrics.cardWidth

  return Array.from({ length: count }, (_, index): RingCardPlacement => {
    const angle = (index / Math.max(1, count)) * Math.PI * 2 + rotation - Math.PI / 2
    const depthProgress = (Math.sin(angle) + 1) / 2
    return {
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
      z: Math.sin(angle) * depth,
      rotation: Math.cos(angle) * (metrics.isMobile ? 2 : 4.5),
      rotationY: -Math.cos(angle) * (metrics.isMobile ? 12 : 22),
      scale: baseScale * ((metrics.isMobile ? 0.78 : 0.7) + depthProgress * (metrics.isMobile ? 0.25 : 0.55)),
      opacity: (metrics.isMobile ? 0.58 : 0.45) + depthProgress * (metrics.isMobile ? 0.42 : 0.55),
    }
  })
}

export function createMemoryRingLayout(metrics: FilmLayoutMetrics, count: number): RingLayout {
  const rotationDegrees = metrics.isMobile ? 72 : 104
  return {
    placements: createRingPlacements(metrics, count, 0),
    rotatedPlacements: createRingPlacements(metrics, count, rotationDegrees),
    radiusX: Math.min(metrics.width * (metrics.isMobile ? 0.31 : 0.37), metrics.isMobile ? 126 : 720),
    radiusY: Math.min(metrics.height * (metrics.isMobile ? 0.18 : 0.22), metrics.isMobile ? 148 : 260),
    heroWidth: metrics.visualScale.ringHeroWidth,
  }
}

export function createMemoryTunnelLayout(metrics: FilmLayoutMetrics, count: number): TunnelCardPlacement[] {
  const xLimit = metrics.width * (metrics.isMobile ? 0.3 : 0.35)
  const yLimit = metrics.height * (metrics.isMobile ? 0.24 : 0.29)
  const waveSize = metrics.isMobile ? 4 : 5
  const tracks = [
    { x: -xLimit, y: -yLimit * 0.62 },
    { x: xLimit, y: yLimit * 0.56 },
    { x: -xLimit * 0.7, y: yLimit },
    { x: xLimit * 0.72, y: -yLimit },
  ]

  return Array.from({ length: count }, (_, index) => {
    const wave = Math.floor(index / waveSize)
    const waveOrder = index % waveSize
    const track = tracks[index % tracks.length]
    const startScale = metrics.visualScale.tunnelMinScale + (index % 3) * 0.055
    const endScale = metrics.visualScale.tunnelMaxScale - (index % 4) * (metrics.isMobile ? 0.07 : 0.11)
    const lateral = signedNoise(index, 51)
    return {
      x: track.x * 0.2 + lateral * 22,
      y: track.y * 0.2 + signedNoise(index, 52) * 18,
      z: metrics.isMobile ? -720 : -1180,
      rotation: signedNoise(index, 53) * (metrics.isMobile ? 3 : 6),
      scale: startScale,
      endX: track.x * (metrics.isMobile ? 1.35 : 1.55) + lateral * (metrics.isMobile ? 24 : 64),
      endY: track.y * (metrics.isMobile ? 1.32 : 1.52) + signedNoise(index, 54) * (metrics.isMobile ? 20 : 50),
      endZ: metrics.isMobile ? 360 : 680,
      endScale,
      wave,
      waveOrder,
    }
  })
}

function evenlySpacedIndices(count: number, desired: number) {
  const result = new Set<number>()
  for (let index = 0; index < desired; index += 1) {
    result.add(Math.min(count - 1, Math.floor(((index + 0.5) * count) / desired)))
  }
  return result
}

export function createFinalGatheringLayout(width: number, height: number, count: number): GatheringLayout {
  const isMobile = width < 720
  const visualScale = createSceneVisualScale(width, height, isMobile)
  const heroCount = Math.min(count, isMobile ? 3 : count >= 30 ? 6 : Math.max(2, Math.round(count * 0.15)))
  const middleCount = Math.min(count - heroCount, isMobile ? 7 : count >= 30 ? 14 : Math.max(3, Math.round(count * 0.32)))
  const backgroundCount = Math.max(0, count - heroCount - middleCount)
  const heroIndices = evenlySpacedIndices(count, heroCount)
  const remaining = Array.from({ length: count }, (_, index) => index).filter((index) => !heroIndices.has(index))
  const middleIndices = new Set(remaining.filter((_, index) => index % Math.max(1, Math.floor(remaining.length / Math.max(1, middleCount))) === 0).slice(0, middleCount))
  for (const index of remaining) {
    if (middleIndices.size >= middleCount) break
    middleIndices.add(index)
  }

  const baseWidth = createMetrics(width, height, Math.min(count, isMobile ? 10 : 20)).cardWidth
  let heroPosition = 0
  let middlePosition = 0
  let backgroundPosition = 0
  const placements = Array.from({ length: count }, (_, index): GatheringCardPlacement => {
    let tier: GatheringTier
    let targetWidth: number
    let x: number
    let y: number
    let z: number
    let opacity: number

    if (heroIndices.has(index)) {
      tier = 'hero'
      targetWidth = visualScale.finalHeroWidth
      const columns = isMobile ? 2 : 3
      const row = Math.floor(heroPosition / columns)
      const column = heroPosition % columns
      const xStep = targetWidth * (isMobile ? 0.78 : 0.96)
      const yStep = targetWidth * (isMobile ? 1.02 : 1.12)
      x = (column - (Math.min(columns, heroCount) - 1) / 2) * xStep + signedNoise(index, 61) * 12
      y = (row - (Math.ceil(heroCount / columns) - 1) / 2) * yStep + signedNoise(index, 62) * 10
      z = 180 + heroPosition * 6
      opacity = 1
      heroPosition += 1
    } else if (middleIndices.has(index)) {
      tier = 'middle'
      targetWidth = visualScale.finalMiddleWidth
      const angle = (middlePosition / Math.max(1, middleCount)) * Math.PI * 2 - Math.PI / 2
      x = Math.cos(angle) * width * (isMobile ? 0.3 : 0.31)
      y = Math.sin(angle) * height * (isMobile ? 0.25 : 0.27)
      z = 60 + signedNoise(index, 63) * 35
      opacity = 0.88
      middlePosition += 1
    } else {
      tier = 'background'
      targetWidth = visualScale.finalBackgroundWidth
      const outerRing = backgroundPosition % 2 === 0
      const ringPosition = Math.floor(backgroundPosition / 2)
      const ringCount = Math.max(1, Math.ceil(backgroundCount / 2))
      const angle = (ringPosition / ringCount) * Math.PI * 2 - Math.PI / 2 + (outerRing ? 0 : 0.16)
      x = Math.cos(angle) * width * (outerRing ? (isMobile ? 0.41 : 0.43) : (isMobile ? 0.36 : 0.38))
      y = Math.sin(angle) * height * (outerRing ? (isMobile ? 0.34 : 0.35) : (isMobile ? 0.3 : 0.31))
      z = -120 + signedNoise(index, 64) * 55
      opacity = isMobile ? Math.max(0.18, 0.5 - Math.floor(backgroundPosition / 12) * 0.08) : 0.63
      backgroundPosition += 1
    }

    return {
      x,
      y,
      z,
      rotation: signedNoise(index, 65) * (isMobile ? 3.5 : 5),
      scale: targetWidth / baseWidth,
      opacity: isMobile && tier === 'background' && backgroundPosition > 8 ? 0 : opacity,
      tier,
      visibleInFinal: !isMobile || tier !== 'background' || backgroundPosition <= 8,
    }
  })

  return {
    metrics: {
      width,
      height,
      cardWidth: baseWidth,
      cardHeight: baseWidth * (4 / 3),
      isMobile,
      visualScale,
    },
    placements,
    columns: 0,
    rows: 0,
    usesTitleOverlay: true,
    tierCounts: { hero: heroCount, middle: middleCount, background: backgroundCount },
  }
}
