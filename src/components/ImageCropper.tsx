import { AnimatePresence, motion } from 'framer-motion'
import Cropper, { type Area, type MediaSize, type Size } from 'react-easy-crop'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { maximumPhotoSize } from '../storage/PhotoStorage'

const cropAspect = 3 / 4
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

function largestCropSize(containerWidth: number, containerHeight: number): Size {
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

async function createCroppedFile(imageSrc: string, crop: Area, filename: string) {
  const image = await loadImage(imageSrc)
  const safeCrop = validatedPixelCrop(crop, image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('当前浏览器无法创建裁剪画布。')

  const initialScale = Math.min(1, maximumOutputLongEdge / safeCrop.height)
  let outputWidth = Math.max(3, Math.floor((safeCrop.width * initialScale) / 3) * 3)
  let outputHeight = (outputWidth / 3) * 4

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

    outputWidth = Math.max(3, Math.floor((outputWidth * dimensionReduction) / 3) * 3)
    outputHeight = (outputWidth / 3) * 4
  }

  throw new Error('裁剪后的照片仍然太大，请适当放大裁剪区域后重试。')
}

export function ImageCropper({
  imageSrc,
  filename,
  current,
  total,
  isNearTargetRatio,
  onCancel,
  onConfirm,
}: ImageCropperProps) {
  const cropViewportRef = useRef<HTMLDivElement>(null)
  const hasSetInitialZoom = useRef(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null)
  const [cropSize, setCropSize] = useState<Size | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const minZoom = useMemo(() => minimumCoverZoom(mediaSize, cropSize), [cropSize, mediaSize])
  const maxZoom = Math.max(3, minZoom * 3)

  useEffect(() => {
    hasSetInitialZoom.current = false
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setMediaSize(null)
    setCroppedAreaPixels(null)
    setError(null)
  }, [imageSrc])

  useEffect(() => {
    const viewport = cropViewportRef.current
    if (!viewport) return

    const updateCropSize = () => {
      const bounds = viewport.getBoundingClientRect()
      const nextSize = largestCropSize(bounds.width, bounds.height)
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
  }, [])

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
      const file = await createCroppedFile(imageSrc, croppedAreaPixels, filename)
      await onConfirm(file)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '照片裁剪失败，请重试。')
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isProcessing) onCancel()
        }}
        role="presentation"
      >
        <motion.section
          className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/10 bg-[#f8f8f6] shadow-[0_32px_100px_rgba(0,0,0,0.35)] dark:bg-[#151515] sm:rounded-[26px]"
          initial={{ opacity: 0, y: 26, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.99 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cropper-title"
        >
          <header className="flex items-start justify-between px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
            <div className="min-w-0 pr-5">
              <p className="mb-2 text-[9px] font-semibold tracking-[0.2em] text-neutral-400">
                第 {current} / {total} 张 · 固定 3:4
              </p>
              <h2 id="cropper-title" className="text-xl font-medium tracking-[-0.035em] sm:text-2xl">裁剪照片</h2>
              <p className="mt-2 truncate text-[11px] text-neutral-400">{filename}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/60 text-lg text-neutral-600 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-40 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.09]"
              aria-label="取消裁剪"
            >
              ×
            </button>
          </header>

          <div ref={cropViewportRef} className="relative mx-4 h-[54dvh] min-h-[320px] overflow-hidden rounded-[20px] bg-[#111] sm:mx-7 sm:h-[58dvh] sm:max-h-[610px] sm:min-h-[390px] sm:rounded-[22px]">
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
                classes={{ cropAreaClassName: '!border-white/90 !shadow-[0_0_0_9999em_rgba(0,0,0,0.52)]' }}
              />
            )}
          </div>

          <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-7 sm:pt-5">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-neutral-400">缩放</span>
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={zoom}
                onChange={(event) => handleZoomChange(Number(event.target.value))}
                className="h-1 flex-1 cursor-pointer accent-neutral-900 dark:accent-neutral-100"
                aria-label="照片缩放"
              />
              <span className="w-9 text-right text-[10px] tabular-nums text-neutral-400">{zoom.toFixed(1)}×</span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isNearTargetRatio ? '比例已接近 3:4，确认后即可加入回忆。' : '拖动照片调整位置，滚轮或滑块可以缩放。'}
                </p>
                <p className="mt-1.5 text-[10px] text-neutral-400 dark:text-neutral-600">将保留合理分辨率并保存为高质量 WebP，单张不超过 10 MB。</p>
                {error && <p className="mt-2 text-xs text-red-600 dark:text-red-300" role="alert">{error}</p>}
              </div>
              <div className="flex shrink-0 gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-medium transition-colors hover:bg-black/[0.04] disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/[0.06]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void confirmCrop()}
                  disabled={!croppedAreaPixels || isProcessing}
                  className="min-w-24 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white transition-transform hover:scale-[1.015] active:scale-[0.985] disabled:cursor-wait disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
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
