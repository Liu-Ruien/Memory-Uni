export type PhotoAspectId = 'portrait' | 'landscape' | 'square'

export interface PhotoAspectPreset {
  id: PhotoAspectId
  label: string
  description: string
  aspect: number
  widthRatio: number
  heightRatio: number
}

export const photoAspectPresets: Record<PhotoAspectId, PhotoAspectPreset> = {
  portrait: {
    id: 'portrait',
    label: '竖屏 3:4',
    description: '适合人物与竖幅照片',
    aspect: 3 / 4,
    widthRatio: 3,
    heightRatio: 4,
  },
  landscape: {
    id: 'landscape',
    label: '横屏 16:9',
    description: '适合合照与风景照片',
    aspect: 16 / 9,
    widthRatio: 16,
    heightRatio: 9,
  },
  square: {
    id: 'square',
    label: '方形 1:1',
    description: '适合接近方形的照片',
    aspect: 1,
    widthRatio: 1,
    heightRatio: 1,
  },
}

export function detectPhotoAspect(width: number, height: number): PhotoAspectPreset {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return photoAspectPresets.portrait
  }

  const sourceAspect = width / height
  if (sourceAspect >= 1.1) return photoAspectPresets.landscape
  if (sourceAspect <= 0.9) return photoAspectPresets.portrait
  return photoAspectPresets.square
}

export function isNearPhotoAspect(width: number, height: number, preset: PhotoAspectPreset) {
  if (width <= 0 || height <= 0) return false
  return Math.abs(width / height - preset.aspect) <= 0.025
}

export function fitPhotoAspectDimensions(
  sourceWidth: number,
  sourceHeight: number,
  preset: PhotoAspectPreset,
  maximumLongEdge: number,
) {
  const scale = Math.min(1, maximumLongEdge / Math.max(sourceWidth, sourceHeight))
  const scaledWidth = sourceWidth * scale
  const width = Math.max(
    preset.widthRatio,
    Math.floor(scaledWidth / preset.widthRatio) * preset.widthRatio,
  )

  return {
    width,
    height: (width / preset.widthRatio) * preset.heightRatio,
  }
}
