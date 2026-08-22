import { useEffect, useMemo, useRef } from 'react'

interface ScrollTextRevealProps {
  text: string
  className?: string
}

const clamp = (value: number, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value))

export function ScrollTextReveal({ text, className = '' }: ScrollTextRevealProps) {
  const rootRef = useRef<HTMLParagraphElement>(null)
  const characters = useMemo(() => Array.from(text), [text])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const glyphs = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-glyph]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let isObserved = false

    const render = () => {
      frameId = 0

      if (reduceMotion.matches) {
        glyphs.forEach((glyph) => {
          glyph.style.opacity = '1'
          glyph.style.transform = 'none'
        })
        return
      }

      const bounds = root.getBoundingClientRect()
      const startLine = window.innerHeight * 0.84
      const endLine = window.innerHeight * 0.38
      const elementProgress = clamp((startLine - bounds.top) / Math.max(1, startLine - endLine))
      const remainingPageDistance = Math.max(
        0,
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight),
      )
      const pageEndBuffer = Math.max(48, window.innerHeight * 0.08)
      const pageEndProgress = clamp(
        1 - Math.max(0, remainingPageDistance - pageEndBuffer) / Math.max(1, window.innerHeight * 0.42),
      )
      const readingProgress = Math.max(elementProgress, pageEndProgress)
      const denominator = Math.max(1, glyphs.length - 1)

      glyphs.forEach((glyph, index) => {
        const characterOffset = (index / denominator) * 0.58
        const characterProgress = clamp((readingProgress - characterOffset) / 0.42)
        const opacity = 0.2 + characterProgress * 0.8
        const translateY = (1 - characterProgress) * 4

        glyph.style.opacity = opacity.toFixed(3)
        glyph.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`
      })
    }

    const requestRender = () => {
      if (!frameId) frameId = window.requestAnimationFrame(render)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isObserved = entry.isIntersecting
        if (isObserved) {
          window.addEventListener('scroll', requestRender, { passive: true })
          window.addEventListener('resize', requestRender)
          requestRender()
        } else {
          window.removeEventListener('scroll', requestRender)
          window.removeEventListener('resize', requestRender)
        }
      },
      { rootMargin: '18% 0px 18% 0px', threshold: 0 },
    )

    const handleMotionPreference = () => requestRender()
    reduceMotion.addEventListener('change', handleMotionPreference)
    observer.observe(root)
    requestRender()

    return () => {
      observer.disconnect()
      reduceMotion.removeEventListener('change', handleMotionPreference)
      window.removeEventListener('scroll', requestRender)
      window.removeEventListener('resize', requestRender)
      if (frameId) window.cancelAnimationFrame(frameId)
      if (isObserved) isObserved = false
    }
  }, [characters])

  return (
    <p ref={rootRef} className={`scroll-text-reveal ${className}`} aria-label={text}>
      <span aria-hidden="true">
        {characters.map((character, index) => (
          <span key={`${character}-${index}`} data-reveal-glyph className="scroll-text-reveal-glyph">
            {character}
          </span>
        ))}
      </span>
    </p>
  )
}
