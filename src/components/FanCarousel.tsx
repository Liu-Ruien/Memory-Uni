import { motion, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Photo } from '../data/photos'
import { useCarouselAnimation } from '../hooks/useCarouselAnimation'
import { PhotoCard, type CardLayout } from './PhotoCard'

interface FanCarouselProps {
  photos: Photo[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  onOpen: () => void
  keyboardEnabled?: boolean
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))

  useEffect(() => {
    let frame = 0
    const handleResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setWidth(window.innerWidth))
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return width
}

function circularDistance(index: number, activeIndex: number, length: number) {
  let distance = index - activeIndex
  if (distance > length / 2) distance -= length
  if (distance < -length / 2) distance += length
  return distance
}

export function FanCarousel({
  photos,
  activeIndex,
  onActiveIndexChange,
  onOpen,
  keyboardEnabled = true,
}: FanCarouselProps) {
  const viewportWidth = useViewportWidth()
  const dragged = useRef(false)
  const selectionTimers = useRef<number[]>([])
  const [liftingPhotoId, setLiftingPhotoId] = useState<string | null>(null)
  const { carouselRef, hasEntered, entranceDelay, entranceRotation } = useCarouselAnimation()
  const isMobile = viewportWidth < 640
  const isTablet = viewportWidth < 1024
  const radius = isTablet ? 2 : 3
  const cardWidth = isMobile ? Math.min(viewportWidth * 0.68, 310) : isTablet ? Math.min(viewportWidth * 0.48, 340) : Math.min(viewportWidth * 0.245, 356)
  const step = isMobile ? cardWidth * 0.43 : isTablet ? cardWidth * 0.5 : cardWidth * 0.58

  const goTo = useCallback(
    (index: number) => onActiveIndexChange((index + photos.length) % photos.length),
    [onActiveIndexChange, photos.length],
  )

  const goBy = useCallback((direction: number) => goTo(activeIndex + direction), [activeIndex, goTo])

  useEffect(() => () => selectionTimers.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    if (!keyboardEnabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goBy(1)
      if (event.key === 'ArrowLeft') goBy(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBy, keyboardEnabled])

  useEffect(() => {
    const preloadIndexes = [-2, -1, 1, 2]
    preloadIndexes.forEach((offset) => {
      const image = new Image()
      image.src = photos[(activeIndex + offset + photos.length) % photos.length].src
    })
  }, [activeIndex, photos])

  const layoutFor = (distance: number): CardLayout => {
    const absolute = Math.abs(distance)
    const direction = Math.sign(distance)
    return {
      x: distance * step,
      y: absolute * (isMobile ? 16 : 22),
      rotate: direction * (absolute === 1 ? 6 : absolute === 2 ? 10 : absolute === 3 ? 14 : 18),
      scale: absolute === 0 ? 1 : absolute === 1 ? 0.94 : absolute === 2 ? 0.88 : absolute === 3 ? 0.82 : 0.76,
      opacity: absolute > radius ? 0 : 1,
      zIndex: 30 - absolute,
    }
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldMove = Math.abs(info.offset.x) > 56 || Math.abs(info.velocity.x) > 500
    if (shouldMove) goBy(info.offset.x < 0 ? 1 : -1)
    window.setTimeout(() => {
      dragged.current = false
    }, 0)
  }

  const selectPhoto = (photo: Photo, index: number, distance: number) => {
    if (dragged.current || liftingPhotoId) return
    if (distance === 0) {
      onOpen()
      return
    }

    setLiftingPhotoId(photo.id)
    selectionTimers.current.push(window.setTimeout(() => goTo(index), 150))
    selectionTimers.current.push(window.setTimeout(() => setLiftingPhotoId(null), 760))
  }

  return (
    <section ref={carouselRef} id="moments" className="scroll-mt-20 pt-10 sm:pt-12" aria-label="大学回忆照片轮播">
      <motion.div
        className="relative mx-auto h-[380px] w-full max-w-[1360px] touch-pan-y select-none sm:h-[min(460px,58vh)] lg:h-[min(520px,60vh)]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragStart={() => {
          dragged.current = true
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="absolute inset-x-0 top-2 h-full">
          {photos.map((photo, index) => {
            const distance = circularDistance(index, activeIndex, photos.length)
            return (
            <PhotoCard
              key={photo.id}
              photo={photo}
              layout={layoutFor(distance)}
              width={cardWidth}
              isCenter={distance === 0}
              hasEntered={hasEntered}
              entranceDelay={entranceDelay(distance)}
              entranceRotate={entranceRotation(distance, photo.id)}
              isLifting={liftingPhotoId === photo.id}
              onSelect={() => selectPhoto(photo, index, distance)}
            />
            )
          })}
        </div>
      </motion.div>

      <div className="relative z-30 mt-2 flex items-center justify-center gap-5 sm:mt-3 sm:gap-7" aria-label="轮播控制">
        <button
          type="button"
          onClick={() => goBy(-1)}
          className="grid size-11 place-items-center rounded-full border border-black/10 bg-white/55 text-lg text-neutral-700 shadow-sm transition-all hover:-translate-x-0.5 hover:bg-white dark:border-white/15 dark:bg-white/[0.05] dark:text-neutral-200 dark:hover:bg-white/[0.1]"
          aria-label="上一张照片"
        >
          ←
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="选择照片">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-5 bg-neutral-800 dark:bg-neutral-100'
                  : 'w-1.5 bg-neutral-300 hover:bg-neutral-500 dark:bg-neutral-700 dark:hover:bg-neutral-500'
              }`}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`显示共同回忆照片 ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goBy(1)}
          className="grid size-11 place-items-center rounded-full border border-black/10 bg-white/55 text-lg text-neutral-700 shadow-sm transition-all hover:translate-x-0.5 hover:bg-white dark:border-white/15 dark:bg-white/[0.05] dark:text-neutral-200 dark:hover:bg-white/[0.1]"
          aria-label="下一张照片"
        >
          →
        </button>
      </div>

    </section>
  )
}
