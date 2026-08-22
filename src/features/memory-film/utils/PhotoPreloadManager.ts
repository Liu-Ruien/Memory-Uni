import type { Photo } from '../../../data/photos'

export interface PhotoPreloadProgress {
  completed: number
  successful: number
  total: number
}

type ProgressListener = (progress: PhotoPreloadProgress) => void

async function decodeImage(source: string) {
  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = 'high'

  const loaded = new Promise<boolean>((resolve) => {
    image.onload = () => resolve(true)
    image.onerror = () => resolve(false)
  })

  image.src = source
  const didLoad = image.complete && image.naturalWidth > 0 ? true : await loaded
  if (!didLoad) return false

  try {
    await image.decode()
  } catch {
    // A completed image can still reject decode() in WebKit; it remains usable.
  }
  return image.naturalWidth > 0
}

export class PhotoPreloadManager {
  private readonly cache = new Map<string, Promise<boolean>>()
  private readonly queue: Array<{
    source: string
    resolve: (successful: boolean) => void
  }> = []
  private activeCount = 0

  constructor(private readonly concurrency = 4) {}

  private load(source: string) {
    const cached = this.cache.get(source)
    if (cached) return cached

    const task = new Promise<boolean>((resolve) => {
      this.queue.push({ source, resolve })
      this.drainQueue()
    })
    this.cache.set(source, task)
    return task
  }

  private drainQueue() {
    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const queued = this.queue.shift()
      if (!queued) return
      this.activeCount += 1
      void decodeImage(queued.source)
        .then(queued.resolve)
        .finally(() => {
          this.activeCount -= 1
          this.drainQueue()
        })
    }
  }

  async preload(photos: Photo[], onProgress?: ProgressListener) {
    const sources = Array.from(new Set(photos.map((photo) => photo.src)))
    const progress: PhotoPreloadProgress = {
      completed: 0,
      successful: 0,
      total: sources.length,
    }
    await Promise.all(sources.map(async (source) => {
        const successful = await this.load(source)
        progress.completed += 1
        if (successful) progress.successful += 1
        onProgress?.({ ...progress })
    }))
    return progress
  }
}
