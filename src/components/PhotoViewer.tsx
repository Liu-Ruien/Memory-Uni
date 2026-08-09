import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import type { Photo } from '../data/photos'
import { formatTakenAt } from '../lib/photoTakenAt'
import { MorphSlider, type MorphSliderItem } from './MorphSlider'

interface PhotoViewerProps {
  photos: Photo[]
  activeIndex: number
  isOpen: boolean
  onClose: () => void
  onActiveIndexChange: (index: number) => void
}

export function PhotoViewer({ photos, activeIndex, isOpen, onClose, onActiveIndexChange }: PhotoViewerProps) {
  const items = useMemo<MorphSliderItem[]>(
    () => photos.map((photo) => {
      const takenAt = formatTakenAt(photo.takenAt)
      return {
        image: photo.src,
        alt: photo.alt,
        caption: takenAt ? `拍摄于 ${takenAt}` : undefined,
      }
    }),
    [photos],
  )

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const photo = photos[activeIndex]
  const takenAt = formatTakenAt(photo?.takenAt)
  const captionTitle = photo && photo.title !== '未命名回忆' ? photo.title : ''

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/[0.96] px-3 pb-20 pt-16 text-white sm:px-10 sm:pb-24 sm:pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`沉浸式照片浏览：${photo.title}`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-xl text-white/90 backdrop-blur-md transition-colors hover:bg-white/[0.14] sm:right-7 sm:top-7"
            aria-label="关闭照片浏览"
          >
            ×
          </button>

          <motion.div
            className="relative h-full max-h-[820px] w-full max-w-[1380px] overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#0b0b0d] shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:rounded-[22px]"
            initial={{ opacity: 0, scale: 0.965, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.975, y: 8 }}
            transition={{ type: 'spring', stiffness: 165, damping: 24, mass: 0.9 }}
            onClick={(event) => event.stopPropagation()}
          >
            <MorphSlider
              items={items}
              startIndex={activeIndex}
              transition="melt"
              duration={1.05}
              intensity={0.5}
              aberration={0.24}
              drift={0.22}
              radius={18}
              onIndexChange={onActiveIndexChange}
              onClose={onClose}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`viewer-caption-${photo.id}`}
              className="pointer-events-none absolute inset-x-0 bottom-5 z-20 text-center sm:bottom-7"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {captionTitle && <p className="text-sm font-medium">{captionTitle}</p>}
              <p className={`${captionTitle ? 'mt-1' : ''} text-xs tracking-[0.06em] text-white/50`}>
                {takenAt ? `拍摄于 ${takenAt}` : '拍摄时间未知'}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute bottom-6 right-6 z-20 hidden text-[10px] tabular-nums tracking-[0.15em] text-white/35 sm:block">
            {String(activeIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
