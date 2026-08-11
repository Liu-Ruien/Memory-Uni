import { useEffect, useState } from 'react'

interface PhotoPresentation {
  aspect: number
  accent: string
}

const presentationCache = new Map<string, PhotoPresentation>()
const sampleSize = 20

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount
const clampChannel = (value: number) => Math.round(Math.min(238, Math.max(64, value)))

function extractSoftAccent(image: HTMLImageElement, fallbackAccent: string) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = sampleSize
    canvas.height = sampleSize
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return fallbackAccent

    context.drawImage(image, 0, 0, sampleSize, sampleSize)
    const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data
    let red = 0
    let green = 0
    let blue = 0
    let totalWeight = 0

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3] / 255
      if (alpha < 0.45) continue

      const pixelRed = pixels[index]
      const pixelGreen = pixels[index + 1]
      const pixelBlue = pixels[index + 2]
      const maximum = Math.max(pixelRed, pixelGreen, pixelBlue)
      const minimum = Math.min(pixelRed, pixelGreen, pixelBlue)
      const chroma = (maximum - minimum) / 255
      const luminance = (pixelRed * 0.2126 + pixelGreen * 0.7152 + pixelBlue * 0.0722) / 255
      const weight = alpha * (0.55 + chroma * 0.8) * (luminance < 0.04 ? 0.18 : 1)

      red += pixelRed * weight
      green += pixelGreen * weight
      blue += pixelBlue * weight
      totalWeight += weight
    }

    if (totalWeight <= 0) return fallbackAccent

    let averageRed = red / totalWeight
    let averageGreen = green / totalWeight
    let averageBlue = blue / totalWeight
    const luminance = averageRed * 0.2126 + averageGreen * 0.7152 + averageBlue * 0.0722

    if (luminance < 76) {
      averageRed = mix(averageRed, 154, 0.5)
      averageGreen = mix(averageGreen, 154, 0.5)
      averageBlue = mix(averageBlue, 228, 0.5)
    }

    const whiteMix = luminance < 118 ? 0.26 : 0.16
    const softenedRed = clampChannel(mix(averageRed, 255, whiteMix))
    const softenedGreen = clampChannel(mix(averageGreen, 255, whiteMix))
    const softenedBlue = clampChannel(mix(averageBlue, 255, whiteMix))

    return `rgb(${softenedRed} ${softenedGreen} ${softenedBlue})`
  } catch {
    return fallbackAccent
  }
}

export function usePhotoPresentation(src: string, fallbackAccent: string, fallbackAspect = 3 / 4) {
  const [presentation, setPresentation] = useState<PhotoPresentation>(() => (
    presentationCache.get(src) ?? { aspect: fallbackAspect, accent: fallbackAccent }
  ))

  useEffect(() => {
    if (!src) return

    const cached = presentationCache.get(src)
    if (cached) {
      setPresentation(cached)
      return
    }

    let cancelled = false

    const loadImage = (withCors: boolean) => {
      const image = new Image()
      image.decoding = 'async'
      if (withCors) image.crossOrigin = 'anonymous'

      image.onload = () => {
        const nextPresentation = {
          aspect: image.naturalWidth > 0 && image.naturalHeight > 0
            ? image.naturalWidth / image.naturalHeight
            : fallbackAspect,
          accent: withCors ? extractSoftAccent(image, fallbackAccent) : fallbackAccent,
        }
        presentationCache.set(src, nextPresentation)
        if (!cancelled) setPresentation(nextPresentation)
      }

      image.onerror = () => {
        if (withCors) {
          loadImage(false)
          return
        }
        if (!cancelled) setPresentation({ aspect: fallbackAspect, accent: fallbackAccent })
      }

      image.src = src
    }

    loadImage(true)
    return () => {
      cancelled = true
    }
  }, [fallbackAccent, fallbackAspect, src])

  return presentation
}
