import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Photo } from '../data/photos'
import { carouselEntranceSpring } from '../hooks/useCarouselAnimation'

export interface CardLayout {
  x: number
  y: number
  rotate: number
  scale: number
  opacity: number
  zIndex: number
}

interface PhotoCardProps {
  photo: Photo
  layout: CardLayout
  width: number
  isCenter: boolean
  hasEntered: boolean
  entranceDelay: number
  entranceRotate: number
  isLifting: boolean
  onSelect: () => void
}

const cardSpring = { type: 'spring' as const, stiffness: 150, damping: 22, mass: 0.9 }
const selectionSpring = { type: 'spring' as const, stiffness: 130, damping: 21, mass: 0.9 }

export function PhotoCard({
  photo,
  layout,
  width,
  isCenter,
  hasEntered,
  entranceDelay,
  entranceRotate,
  isLifting,
  onSelect,
}: PhotoCardProps) {
  const [entranceFinished, setEntranceFinished] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const hoverActive = isHovered && !isLifting && hasEntered
  const targetY = isLifting
    ? layout.y - (isCenter ? 10 : 24)
    : hoverActive
      ? layout.y - (isCenter ? 10 : 15)
      : layout.y
  const targetScale = isLifting
    ? Math.max(layout.scale + 0.055, isCenter ? 1.025 : 0)
    : hoverActive
      ? isCenter ? layout.scale * 1.03 : layout.scale + 0.04
      : layout.scale
  const targetRotate = isLifting ? 0 : hoverActive && !isCenter ? layout.rotate * 0.5 : layout.rotate

  return (
    <motion.button
      type="button"
      onClick={() => {
        setIsHovered(false)
        onSelect()
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label={isCenter ? `全屏查看：${photo.title}` : `将照片移到中央：${photo.title}`}
      className="group absolute left-1/2 top-0 block overflow-hidden rounded-[24px] bg-neutral-200 text-left shadow-[0_18px_50px_rgba(22,22,18,0.12)] outline-none ring-1 ring-black/[0.05] will-change-transform dark:bg-neutral-800 dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] dark:ring-white/[0.08] sm:rounded-[28px]"
      style={{ width, marginLeft: -width / 2, aspectRatio: '3 / 4', zIndex: isLifting ? 60 : layout.zIndex, transformOrigin: '50% 92%', pointerEvents: layout.opacity === 0 ? 'none' : 'auto' }}
      initial={{
        x: layout.x,
        y: layout.y + 80,
        rotate: entranceRotate,
        scale: 0.85,
        opacity: 0,
      }}
      animate={hasEntered ? {
        x: layout.x,
        y: targetY,
        rotate: targetRotate,
        scale: targetScale,
        opacity: layout.opacity,
        boxShadow: isLifting
          ? '0 34px 80px rgba(22,22,18,0.22)'
          : hoverActive
            ? isCenter ? '0 32px 78px rgba(22,22,18,0.2)' : '0 28px 68px rgba(22,22,18,0.18)'
            : '0 18px 50px rgba(22,22,18,0.12)',
      } : {
        x: layout.x,
        y: layout.y + 80,
        rotate: entranceRotate,
        scale: 0.85,
        opacity: 0,
      }}
      whileTap={{ scale: layout.scale * 0.985 }}
      transition={
        isLifting
          ? selectionSpring
          : entranceFinished
            ? cardSpring
            : { ...carouselEntranceSpring, delay: hasEntered ? entranceDelay : 0 }
      }
      onAnimationComplete={() => {
        if (hasEntered && !entranceFinished) setEntranceFinished(true)
      }}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        className="h-full w-full select-none object-cover"
        draggable={false}
        loading={isCenter ? 'eager' : 'lazy'}
        fetchPriority={isCenter ? 'high' : 'auto'}
        decoding="async"
      />
      {photo.source === 'supabase' && (photo.title !== '未命名回忆' || photo.uploadedAt) && (
        <span
          className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent px-4 pb-4 pt-14 text-white transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          aria-hidden="true"
        >
          {photo.title !== '未命名回忆' && <span className="block truncate text-[11px] font-medium">{photo.title}</span>}
          {photo.uploadedAt && <span className="mt-1 block text-[9px] tracking-[0.05em] text-white/65">上传于 {photo.uploadedAt}</span>}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" aria-hidden="true" />
    </motion.button>
  )
}
