import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Cropper, { type Area, type MediaSize, type Size } from 'react-easy-crop'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fitPhotoAspectDimensions, type PhotoAspectPreset } from '../lib/photoAspect'
import { maximumPhotoSize } from '../storage/PhotoStorage'
import { appleEaseOut } from '../design/motion'

const cropViewportPadding = 18
const maximumOutputLongEdge = 4096
const qualityLevels = [0.94, 0.9, 0.86]
const dimensionReduction = 0.85
const maximumDimensionPasses = 6

interface ImageCropperProps {
  imageSrc: string
  filename: string
  current: number
  total: number
  isNearTargetRatio: boolean
  aspectPreset: PhotoAspectPreset
  onCancel: () => void
  onConfirm: (file: File) => Promise<void>
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法读取这张照片，请重新选择。'))
    image.src = src
  })
}

function largestCropSize(containerWidth: number, containerHeight: number, cropAspect: number): Size {
  const availableWidth = Math.max(1, containerWidth - cropViewportPadding * 2)
  const availableHeight = Math.max(1, containerHeight - cropViewportPadding * 2)

  if (availableWidth / availableHeight > cropAspect) {
    return { width: availableHeight * cropAspect, height: availableHeight }
  }

  return { width: availableWidth, height: availableWidth / cropAspect }
}

function minimumCoverZoom(mediaSize: MediaSize | null, cropSize: Size | null) {
  if (!mediaSize || !cropSize || mediaSize.width <= 0 || mediaSize.height <= 0) return 1

  const requiredZoom = Math.max(
    cropSize.width / mediaSize.width,
    cropSize.height / mediaSize.height,
  )

  // Round upward so sub-pixel layout differences cannot expose an image edge.
  return Math.ceil(requiredZoom * 10_000) / 10_000
}

function validatedPixelCrop(crop: Area, sourceWidth: number, sourceHeight: number): Area {
  const values = [crop.x, crop.y, crop.width, crop.height, sourceWidth, sourceHeight]
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error('裁剪区域无效，请重新调整照片。')
  }

  const width = Math.round(crop.width)
  const height = Math.round(crop.height)
  const roundedX = Math.round(crop.x)
  const roundedY = Math.round(crop.y)
  const roundingTolerance = 1

  if (
    width <= 0
    || height <= 0
    || width > sourceWidth
    || height > sourceHeight
    || crop.x < -roundingTolerance
    || crop.y < -roundingTolerance
    || crop.x + crop.width > sourceWidth + roundingTolerance
    || crop.y + crop.height > sourceHeight + roundingTolerance
  ) {
    throw new Error('裁剪区域超出了原始照片，请重新调整后再试。')
  }

  const x = Math.min(Math.max(0, roundedX), sourceWidth - width)
  const y = Math.min(Math.max(0, roundedY), sourceHeight - height)

  return { x, y, width, height }
}

async function createCroppedFile(
  imageSrc: string,
  crop: Area,
  filename: string,
  aspectPreset: PhotoAspectPreset,
) {
  const image = await loadImage(imageSrc)
  const safeCrop = validatedPixelCrop(crop, image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('当前浏览器无法创建裁剪画布。')

  let { width: outputWidth, height: outputHeight } = fitPhotoAspectDimensions(
    safeCrop.width,
    safeCrop.height,
    aspectPreset,
    maximumOutputLongEdge,
  )

  for (let dimensionPass = 0; dimensionPass < maximumDimensionPasses; dimensionPass += 1) {
    canvas.width = outputWidth
    canvas.height = outputHeight
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(
      image,
      safeCrop.x,
      safeCrop.y,
      safeCrop.width,
      safeCrop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    )

    for (const quality of qualityLevels) {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('照片裁剪失败，请重试。'))),
          'image/webp',
          quality,
        )
      })

      if (blob.size <= maximumPhotoSize) {
        const basename = filename.replace(/\.[^/.]+$/, '') || 'memory'
        return new File([blob], `${basename}.webp`, { type: 'image/webp', lastModified: Date.now() })
      }
    }

    outputWidth = Math.max(
      aspectPreset.widthRatio,
      Math.floor((outputWidth * dimensionReduction) / aspectPreset.widthRatio) * aspectPreset.widthRatio,
    )
    outputHeight = (outputWidth / aspectPreset.widthRatio) * aspectPreset.heightRatio
  }

  throw new Error('裁剪后的照片仍然太大，请适当放大裁剪区域后重试。')
}

export function ImageCropper({
  imageSrc,
  filename,
  current,
  total,
  isNearTargetRatio,
  aspectPreset,
  onCancel,
  onConfirm,
}: ImageCropperProps) {
  const reduceMotion = useReducedMotion()
  const cropViewportRef = useRef<HTMLDivElement>(null)
  const hasSetInitialZoom = useRef(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null)
  const [cropSize, setCropSize] = useState<Size | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cropAspect = aspectPreset.aspect
  const minZoom = useMemo(() => minimumCoverZoom(mediaSize, cropSize), [cropSize, mediaSize])
  const maxZoom = Math.max(3, minZoom * 3)

  useEffect(() => {
    hasSetInitialZoom.current = false
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setMediaSize(null)
    setCroppedAreaPixels(null)
    setError(null)
  }, [aspectPreset.id, imageSrc])

  useEffect(() => {
    const viewport = cropViewportRef.current
    if (!viewport) return

    const updateCropSize = () => {
      const bounds = viewport.getBoundingClientRect()
      const nextSize = largestCropSize(bounds.width, bounds.height, cropAspect)
      setCropSize((currentSize) => {
        if (
          currentSize
          && Math.abs(currentSize.width - nextSize.width) < 0.5
          && Math.abs(currentSize.height - nextSize.height) < 0.5
        ) {
          return currentSize
        }
        return nextSize
      })
    }

    updateCropSize()
    const observer = new ResizeObserver(updateCropSize)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [cropAspect])

  useEffect(() => {
    if (!mediaSize || !cropSize) return

    if (!hasSetInitialZoom.current) {
      hasSetInitialZoom.current = true
      setCrop({ x: 0, y: 0 })
      setZoom(minZoom)
      return
    }

    setZoom((currentZoom) => Math.min(maxZoom, Math.max(minZoom, currentZoom)))
  }, [cropSize, maxZoom, mediaSize, minZoom])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isProcessing, onCancel])

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleZoomChange = useCallback((nextZoom: number) => {
    setZoom(Math.min(maxZoom, Math.max(minZoom, nextZoom)))
  }, [maxZoom, minZoom])

  const confirmCrop = async () => {
    if (!croppedAreaPixels || isProcessing) return
    setIsProcessing(true)
    setError(null)
    try {
      const file = await createCroppedFile(imageSrc, croppedAreaPixels, filename, aspectPreset)
      await onConfirm(file)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '照片裁剪失败，请重试。')
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/48 p-0 backdrop-blur-lg sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isProcessing) onCancel()
        }}
        role="presentation"
      >
        <motion.section
          className="apple-modal-shell flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden !rounded-b-none !rounded-t-[30px] sm:!rounded-[30px]"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24px) scale(0.985)' }}
          animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px) scale(0.99)' }}
          transition={{ duration: 0.28, ease: appleEaseOut }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cropper-title"
          data-motion-transform="true"
        >
          <span className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-[var(--separator-strong)] sm:hidden" aria-hidden="true" />
          <header className="flex items-start justify-between px-5 pb-4 pt-4 sm:px-7 sm:pb-5 sm:pt-7">
            <div className="min-w-0 pr-5">
              <p className="apple-kicker mb-2">
                步骤 3 / 5 · 裁剪 · 第 {current} / {total} 张
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 id="cropper-title" className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">裁剪为 {aspectPreset.label}</h2>
                <span className="liquid-glass-chip rounded-full px-2.5 py-1 text-[9px] font-semibold text-[var(--text-secondary)]">自动识别</span>
              </div>
              <p className="apple-tertiary-text mt-2 truncate text-[11px]">{filename} · {aspectPreset.description}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="apple-toolbar-button shrink-0 disabled:cursor-wait disabled:opacity-40"
              aria-label="取消裁剪"
            >
              <svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
            </button>
          </header>

          <div ref={cropViewportRef} className="relative mx-4 h-[54dvh] min-h-[320px] overflow-hidden rounded-[22px] bg-black shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.14)] sm:mx-7 sm:h-[58dvh] sm:max-h-[610px] sm:min-h-[390px] sm:rounded-[26px]">
            {cropSize && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                cropSize={cropSize}
                minZoom={minZoom}
                maxZoom={maxZoom}
                cropShape="rect"
                objectFit="contain"
                restrictPosition
                showGrid={!isNearTargetRatio}
                zoomWithScroll
                onMediaLoaded={setMediaSize}
                onCropChange={setCrop}
                onZoomChange={handleZoomChange}
                onCropComplete={handleCropComplete}
                classes={{ cropAreaClassName: '!border-white/85 !shadow-[0_0_0_9999em_rgba(0,0,0,0.58)]' }}
              />
            )}
          </div>

          <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-7 sm:pt-5">
            <div className="flex items-center gap-4">
              <span className="apple-secondary-text text-[10px] font-medium">缩放</span>
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={zoom}
                onChange={(event) => handleZoomChange(Number(event.target.value))}
                className="apple-range h-1 flex-1 cursor-pointer"
                aria-label="照片缩放"
              />
              <span className="apple-tertiary-text w-9 text-right text-[10px] tabular-nums">{zoom.toFixed(1)}×</span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="apple-secondary-text text-xs">
                  {isNearTargetRatio ? `比例已接近${aspectPreset.label}，确认后即可加入回忆。` : `已自动选择${aspectPreset.label}，拖动照片调整取景位置。`}
                </p>
                <p className="apple-tertiary-text mt-1.5 text-[10px]">将保留合理分辨率并保存为高质量 WebP，单张不超过 10 MB。</p>
                {error && <p className="mt-2 text-xs text-red-600 dark:text-red-300" role="alert">{error}</p>}
              </div>
              <div className="flex shrink-0 gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="apple-secondary-button !min-h-11 !px-5 !text-xs disabled:opacity-40"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void confirmCrop()}
                  disabled={!croppedAreaPixels || isProcessing}
                  className="apple-primary-button min-w-24 !min-h-11 !px-5 !text-xs disabled:cursor-wait disabled:opacity-50"
                >
                  {isProcessing ? '正在处理…' : '确认裁剪'}
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  )
}
