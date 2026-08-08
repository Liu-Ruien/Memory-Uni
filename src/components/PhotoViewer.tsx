import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import type { Photo } from '../data/photos'

interface PhotoViewerProps {
  photos: Photo[]
  activeIndex: number
  isOpen: boolean
  onClose: () => void
  onActiveIndexChange: (index: number) => void
}

export function PhotoViewer({ photos, activeIndex, isOpen, onClose, onActiveIndexChange }: PhotoViewerProps) {
  const goBy = useCallback(
    (direction: number) => onActiveIndexChange((activeIndex + direction + photos.length) % photos.length),
    [activeIndex, onActiveIndexChange, photos.length],
  )

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') goBy(1)
      if (event.key === 'ArrowLeft') goBy(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goBy, isOpen, onClose])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 550) {
      goBy(info.offset.x < 0 ? 1 : -1)
    }
  }

  const photo = photos[activeIndex]
  const captionTitle = photo.title !== '未命名回忆' ? photo.title : ''
  const captionMeta = photo.source === 'supabase' && photo.uploadedAt
    ? `上传于 ${photo.uploadedAt}`
    : [photo.location, photo.date].filter(Boolean).join(' · ')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex bg-black/[0.94] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`全屏照片：${photo.title}`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-xl text-white/90 backdrop-blur-md transition-colors hover:bg-white/[0.14] sm:right-7 sm:top-7"
            aria-label="关闭全屏照片"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              goBy(-1)
            }}
            className="absolute left-3 top-1/2 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/20 text-xl text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 sm:grid lg:left-7"
            aria-label="上一张照片"
          >
            ←
          </button>

          <motion.div
            className="flex h-full w-full touch-pan-y flex-col items-center justify-center px-4 pb-24 pt-16 sm:px-20 sm:pb-28 sm:pt-20"
            onClick={(event) => event.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={photo.id}
                className="relative aspect-[3/4] max-w-[88vw] overflow-hidden rounded-[10px] shadow-2xl sm:max-w-[72vw] sm:rounded-[14px]"
                style={{ height: 'min(74vh, calc(88vw * 4 / 3))' }}
                initial={{ opacity: 0, scale: 0.975 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full select-none object-cover"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              goBy(1)
            }}
            className="absolute right-3 top-1/2 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/20 text-xl text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 sm:grid lg:right-7"
            aria-label="下一张照片"
          >
            →
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={`caption-${photo.id}`}
              className="pointer-events-none absolute inset-x-0 bottom-7 z-20 text-center sm:bottom-9"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {captionTitle && <p className="text-sm font-medium">{captionTitle}</p>}
              {captionMeta && <p className={`${captionTitle ? 'mt-1.5' : ''} text-xs text-white/50`}>{captionMeta}</p>}
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute bottom-7 right-6 hidden text-[10px] tabular-nums tracking-[0.15em] text-white/35 sm:block">
            {String(activeIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
