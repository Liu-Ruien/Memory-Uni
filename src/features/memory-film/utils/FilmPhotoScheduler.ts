import type { Photo } from '../../../data/photos'
import {
  FILM_MOBILE_RING_LIMIT,
  FILM_MOBILE_TUNNEL_LIMIT,
  FILM_MOBILE_WALL_LIMIT,
  FILM_SCENE_BATCH_LIMIT,
  FILM_WALL_LIMIT,
} from '../config/filmConfig'

export type FilmSceneName = 'wall' | 'scatter' | 'stream' | 'ring' | 'tunnel' | 'final'

export interface FilmScheduleDebug {
  photoCount: number
  sceneBatches: Record<FilmSceneName, number>
  uniqueShownBeforeFinal: number
  unseenBeforeFinal: number
  unseenAfterFinal: number
}

function photoTimestamp(photo: Photo) {
  const date = photo.takenAt ?? photo.uploadedAt
  if (!date) return Number.MAX_SAFE_INTEGER
  const timestamp = new Date(date).getTime()
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER
}

function rotate<T>(items: T[], offset: number) {
  if (items.length === 0) return []
  const start = ((offset % items.length) + items.length) % items.length
  return [...items.slice(start), ...items.slice(0, start)]
}

function takeWindow<T>(items: T[], size: number, offset: number) {
  return rotate(items, offset).slice(0, Math.min(size, items.length))
}

function reorderForContrast<T>(items: T[]) {
  const result: T[] = []
  let left = 0
  let right = items.length - 1
  while (left <= right) {
    result.push(items[left])
    if (left !== right) result.push(items[right])
    left += 1
    right -= 1
  }
  return result
}

export class FilmPhotoScheduler {
  private readonly chronological: Photo[]
  private readonly batchSize: number
  private readonly wallSize: number

  constructor(photos: Photo[], private readonly isMobile: boolean) {
    this.chronological = [...photos].sort((a, b) => photoTimestamp(a) - photoTimestamp(b))
    this.batchSize = isMobile
      ? Math.min(FILM_MOBILE_WALL_LIMIT, this.chronological.length)
      : Math.min(FILM_SCENE_BATCH_LIMIT, this.chronological.length)
    this.wallSize = Math.min(
      isMobile ? FILM_MOBILE_WALL_LIMIT : FILM_WALL_LIMIT,
      this.chronological.length,
    )
  }

  getAllPhotos() {
    return this.chronological
  }

  getWallPhotos() {
    return this.chronological.slice(0, this.wallSize)
  }

  getScatterPhotos() {
    return reorderForContrast(this.getWallPhotos())
  }

  getStreamPhotos() {
    const offset = Math.floor(this.chronological.length * 0.2)
    // Stream always returns to chronological order so the movement reads as time advancing.
    return takeWindow(this.chronological, this.batchSize, offset)
      .sort((a, b) => photoTimestamp(a) - photoTimestamp(b))
  }

  getRingPhotos() {
    const size = this.isMobile ? Math.min(FILM_MOBILE_RING_LIMIT, this.batchSize) : this.batchSize
    return takeWindow(this.chronological, size, Math.floor(this.chronological.length * 0.4))
  }

  getTunnelPhotos() {
    const size = this.isMobile ? Math.min(FILM_MOBILE_TUNNEL_LIMIT, this.batchSize) : this.batchSize
    return takeWindow(this.chronological, size, Math.floor(this.chronological.length * 0.62))
  }

  getFinalPhotos() {
    // The final mosaic intentionally gathers every photo. This is the coverage guarantee.
    return this.chronological
  }

  getDebugSnapshot(): FilmScheduleDebug {
    const beforeFinal = new Set([
      ...this.getWallPhotos(),
      ...this.getScatterPhotos(),
      ...this.getStreamPhotos(),
      ...this.getRingPhotos(),
      ...this.getTunnelPhotos(),
    ].map((photo) => photo.id))
    const afterFinal = new Set([...beforeFinal, ...this.getFinalPhotos().map((photo) => photo.id)])

    return {
      photoCount: this.chronological.length,
      sceneBatches: {
        wall: this.getWallPhotos().length,
        scatter: this.getScatterPhotos().length,
        stream: this.getStreamPhotos().length,
        ring: this.getRingPhotos().length,
        tunnel: this.getTunnelPhotos().length,
        final: this.getFinalPhotos().length,
      },
      uniqueShownBeforeFinal: beforeFinal.size,
      unseenBeforeFinal: this.chronological.length - beforeFinal.size,
      unseenAfterFinal: this.chronological.length - afterFinal.size,
    }
  }
}
