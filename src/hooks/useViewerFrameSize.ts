import { useEffect, useMemo, useState } from 'react'

interface ViewportSize {
  width: number
  height: number
}

function readViewport(): ViewportSize {
  if (typeof window === 'undefined') return { width: 1280, height: 800 }
  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  }
}

export function useViewerFrameSize(aspect: number, isOpen: boolean) {
  const [viewport, setViewport] = useState(readViewport)

  useEffect(() => {
    if (!isOpen) return

    let frame = 0
    const update = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => setViewport(readViewport()))
    }

    update()
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [isOpen])

  return useMemo(() => {
    const safeAspect = Math.max(0.3, Math.min(3.5, aspect))
    const mobile = viewport.width < 640
    const horizontalInset = mobile ? 16 : 64
    const verticalInset = mobile ? 144 : 160
    const maximumWidth = Math.max(180, Math.min(viewport.width - horizontalInset, 1440))
    const maximumHeight = Math.max(180, Math.min(viewport.height - verticalInset, 860))
    const width = Math.min(maximumWidth, maximumHeight * safeAspect)

    return {
      width,
      height: width / safeAspect,
      aspect: safeAspect,
    }
  }, [aspect, viewport.height, viewport.width])
}
