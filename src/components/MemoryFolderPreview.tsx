import type { Photo } from '../data/photos'

interface MemoryFolderPreviewProps {
  photos: Photo[]
  isLoading: boolean
}

export function MemoryFolderPreview({ photos, isLoading }: MemoryFolderPreviewProps) {
  if (isLoading) {
    return (
      <span className="memory-folder-preview memory-folder-preview-loading" aria-label="照片正在加载">
        <span className="memory-folder-loading-bar" />
        <span className="memory-folder-loading-bar is-short" />
      </span>
    )
  }

  if (photos.length === 0) {
    return (
      <span className="memory-folder-preview memory-folder-preview-empty" aria-label="这一年还没有照片">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="14" rx="3" />
          <path d="m7 15 3-3 2.4 2.4 1.8-1.8 2.8 2.8" />
          <circle cx="15.5" cy="9.5" r="1.25" />
        </svg>
        <span>等待第一张照片</span>
      </span>
    )
  }

  const previewPhotos = photos.slice(0, 3)
  const isStack = photos.length >= 4

  return (
    <span
      className={`memory-folder-preview memory-folder-preview-photos count-${Math.min(photos.length, 3)}${isStack ? ' is-stack' : ''}`}
      aria-label={`文件夹内有 ${photos.length} 张照片`}
    >
      {previewPhotos.map((photo, index) => (
        <span key={photo.id} className={`memory-folder-shot shot-${index + 1}`}>
          <img
            src={photo.src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </span>
      ))}
      {isStack && <span className="memory-folder-count">+{photos.length - 3}</span>}
    </span>
  )
}
