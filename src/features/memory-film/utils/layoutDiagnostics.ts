import {
  createFinalGatheringLayout,
  createMemoryRingLayout,
  createMemoryTunnelLayout,
  createPhotoWallLayout,
  type FilmCardPlacement,
} from './photoLayout'

export interface LayoutDiagnosticResult {
  count: number
  mode: 'desktop' | 'mobile'
  viewport: string
  ringCount: number
  tunnelCount: number
  finite: boolean
  ringWithinSafeArea: boolean
  tunnelWithinSafeArea: boolean
  gatheringWithinViewport: boolean
}

function placementsAreFinite(placements: FilmCardPlacement[]) {
  return placements.every((placement) => [
    placement.x,
    placement.y,
    placement.z,
    placement.rotation,
    placement.scale,
  ].every(Number.isFinite))
}

function diagnose(count: number, width: number, height: number): LayoutDiagnosticResult {
  const mobile = width < 720
  const wallCount = Math.min(count, mobile ? 10 : 20)
  const ringCount = Math.min(count, mobile ? 10 : 20)
  const tunnelCount = Math.min(count, mobile ? 8 : 20)
  const base = createPhotoWallLayout(width, height, wallCount)
  const ring = createMemoryRingLayout(base.metrics, ringCount)
  const tunnel = createMemoryTunnelLayout(base.metrics, tunnelCount)
  const gathering = createFinalGatheringLayout(width, height, count)

  return {
    count,
    mode: mobile ? 'mobile' : 'desktop',
    viewport: `${width}×${height}`,
    ringCount,
    tunnelCount,
    finite: placementsAreFinite(ring.placements)
      && placementsAreFinite(ring.rotatedPlacements)
      && placementsAreFinite(tunnel)
      && placementsAreFinite(gathering.placements),
    ringWithinSafeArea: ring.placements.every((placement) => (
      Math.abs(placement.x) <= width * 0.46 && Math.abs(placement.y) <= height * 0.36
    )),
    tunnelWithinSafeArea: tunnel.every((placement) => (
      Math.abs(placement.x) <= width * 0.46 && Math.abs(placement.y) <= height * 0.42
    )),
    gatheringWithinViewport: gathering.placements.every((placement) => (
      Math.abs(placement.x) + gathering.metrics.cardWidth * placement.scale / 2 <= width / 2 + 1
      && Math.abs(placement.y) + gathering.metrics.cardHeight * placement.scale / 2 <= height / 2 + 1
    )),
  }
}

export function runSyntheticLayoutDiagnostics() {
  return [12, 24, 50].flatMap((count) => [
    diagnose(count, 1440, 900),
    diagnose(count, 375, 812),
    diagnose(count, 390, 844),
  ])
}
