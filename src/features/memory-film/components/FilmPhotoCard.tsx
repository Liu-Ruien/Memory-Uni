import { forwardRef, useState } from 'react'
import type { Photo } from '../../../data/photos'

interface FilmPhotoCardProps {
  photo: Photo
  priority?: boolean
}

type PhotoFit = 'cover' | 'contain'

export const FilmPhotoCard = forwardRef<HTMLDivElement, FilmPhotoCardProps>(function FilmPhotoCard(
  { photo, priority = false },
  ref,
) {
  const [fit, setFit] = useState<PhotoFit>('contain')
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div ref={ref} className="memory-film-photo-card" aria-hidden="true">
      <div className="memory-film-photo-surface" data-image-state={failed ? 'failed' : loaded ? 'ready' : 'loading'}>
        {failed ? (
          <div className="memory-film-photo-fallback">
            <span>M</span>
            <small>Memory Uni</small>
          </div>
        ) : fit === 'contain' ? (
          <img
            className="memory-film-photo-backdrop"
            src={photo.src}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : null}
        {!failed && (
          <img
            className={`memory-film-photo-image memory-film-photo-image--${fit}`}
            src={photo.src}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => {
              setLoaded(false)
              setFailed(true)
            }}
            onLoad={(event) => {
              const image = event.currentTarget
              const ratio = image.naturalWidth / Math.max(1, image.naturalHeight)
              // 横图、方图和过窄竖图保留完整内容；常规竖图使用 cover 呈现照片卡片感。
              setFit(ratio >= 0.88 || ratio < 0.62 ? 'contain' : 'cover')
              setLoaded(true)
            }}
          />
        )}
      </div>
    </div>
  )
})
