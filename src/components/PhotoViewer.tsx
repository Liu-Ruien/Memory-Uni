import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleGestureSpring } from '../design/motion'
import { usePhotoPresentation } from '../hooks/usePhotoPresentation'
import { useDialogFocusScope } from '../hooks/useDialogFocusScope'
import { useViewerFrameSize } from '../hooks/useViewerFrameSize'
import { MorphSlider, type MorphSliderHandle, type MorphSliderItem } from './MorphSlider'

interface PhotoViewerProps {
  photos: Photo[]
  activeIndex: number
  isOpen: boolean
  onClose: () => void
  onActiveIndexChange: (index: number) => void
}

export function PhotoViewer({ photos, activeIndex, isOpen, onClose, onActiveIndexChange }: PhotoViewerProps) {
  const reduceMotion = useReducedMotion()
  const photo = photos[activeIndex]
  const presentation = usePhotoPresentation(
    photo?.src ?? '',
    photo?.accentColor ?? '#BFE8FF',
    photo?.gridAspect ?? 3 / 4,
  )
  const frameSize = useViewerFrameSize(presentation.aspect, isOpen)
  const sliderRef = useRef<MorphSliderHandle>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const viewerDialogRef = useDialogFocusScope<HTMLDivElement>(isOpen && Boolean(photo), {
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  })
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 170, damping: 24, mass: 0.75 })
  const springRotateY = useSpring(rotateY, { stiffness: 170, damping: 24, mass: 0.75 })
  const tiltTransform = useMotionTemplate`perspective(1200px) rotateX(${springRotateX}deg) rotateY(${springRotateY}deg) translateZ(0px)`
  const items = useMemo<MorphSliderItem[]>(
    () => photos.map((photo, index) => ({ image: photo.src, alt: `共同回忆照片 ${index + 1}` })),
    [photos],
  )

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const handleTilt = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      reduceMotion
      || event.pointerType !== 'mouse'
      || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const normalizedX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2
    const normalizedY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2
    rotateX.set(Math.max(-3, Math.min(3, normalizedY * -3)))
    rotateY.set(Math.max(-5, Math.min(5, normalizedX * 5)))
  }

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    resetTilt()
  }, [isOpen, photo?.id])

  useEffect(() => {
    if (!isOpen) return
    const frame = window.requestAnimationFrame(() => sliderRef.current?.refreshSize())
    const settleTimer = window.setTimeout(() => sliderRef.current?.refreshSize(), 480)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(settleTimer)
    }
  }, [frameSize.height, frameSize.width, isOpen])

  const viewerStyle = {
    '--viewer-photo-accent': presentation.accent,
    '--viewer-photo-aspect': frameSize.aspect,
  } as CSSProperties

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          ref={viewerDialogRef}
          className="viewer-photo-space fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-2 pb-20 pt-16 text-white sm:px-8 sm:pb-20 sm:pt-20"
          style={viewerStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: appleEaseOut }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`沉浸式照片浏览：共同回忆照片 ${activeIndex + 1}`}
          tabIndex={-1}
          data-dialog-layer="true"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`viewer-ambient-${photo.id}`}
              className="pointer-events-none absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.18 : 0.25, ease: appleEaseOut }}
              aria-hidden="true"
            >
              <img
                src={photo.src}
                alt=""
                className="viewer-photo-ambient pointer-events-none absolute object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="viewer-photo-atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="viewer-photo-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="absolute inset-x-3 top-3 z-30 flex items-center justify-between sm:inset-x-6 sm:top-5">
            <button ref={closeButtonRef} type="button" onClick={onClose} className="viewer-glass-control" aria-label="关闭照片浏览">
              <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
              </svg>
            </button>
            <div className="viewer-glass-control min-w-[72px] px-3 text-[10px] font-semibold tabular-nums tracking-[0.1em] text-white/78" aria-label={`第 ${activeIndex + 1} 张，共 ${photos.length} 张`}>
              {String(activeIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </div>
          </div>

          <div
            className="viewer-photo-layout relative z-10 flex flex-col items-center"
            style={{ width: frameSize.width }}
          >
            <div
              className="viewer-photo-hit-surface relative z-10"
              style={{ width: frameSize.width, height: frameSize.height }}
              onPointerMove={handleTilt}
              onPointerLeave={resetTilt}
              onPointerCancel={resetTilt}
            >
              <motion.div
                className="viewer-photo-shell relative h-full w-full"
                style={{ transform: tiltTransform }}
                data-motion-transform="true"
              >
                <motion.div
                  layoutId={`memory-photo-${photo.id}`}
                  className="viewer-liquid-frame relative h-full w-full overflow-hidden rounded-[18px] sm:rounded-[28px]"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.975)' }}
                  animate={{ opacity: 1, transform: 'scale(1)' }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.985)' }}
                  transition={{ layout: appleGestureSpring, opacity: { duration: 0.25, ease: appleEaseOut }, transform: appleGestureSpring }}
                  onClick={(event) => event.stopPropagation()}
                  data-motion-transform="true"
                >
                  <MorphSlider
                    ref={sliderRef}
                    items={items}
                    startIndex={activeIndex}
                    transition="melt"
                    duration={1.05}
                    intensity={0.5}
                    aberration={0.24}
                    drift={0.22}
                    radius={3}
                    showControls={false}
                    onIndexChange={onActiveIndexChange}
                    onClose={onClose}
                  />

                </motion.div>
              </motion.div>
            </div>

            {photos.length > 1 && (
              <div
                className="viewer-photo-navigation"
                onClick={(event) => event.stopPropagation()}
                aria-label="照片导航"
              >
                <button type="button" className="morph-slider-button" onClick={() => sliderRef.current?.previous()} aria-label="上一张照片">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m14.5 6-6 6 6 6" />
                  </svg>
                </button>

                <div className="viewer-photo-navigation-indicators" role="tablist" aria-label="照片列表">
                  {items.map((item, itemIndex) => (
                    <button
                      key={item.image}
                      type="button"
                      role="tab"
                      aria-selected={itemIndex === activeIndex}
                      aria-label={`查看第 ${itemIndex + 1} 张照片`}
                      className={`morph-slider-dot ${itemIndex === activeIndex ? 'is-active' : ''}`}
                      onClick={() => sliderRef.current?.goTo(itemIndex)}
                    />
                  ))}
                </div>

                <button type="button" className="morph-slider-button" onClick={() => sliderRef.current?.next()} aria-label="下一张照片">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9.5 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
