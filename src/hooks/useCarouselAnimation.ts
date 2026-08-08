import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export const carouselEntranceSpring = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 22,
  mass: 0.9,
}

export function useCarouselAnimation() {
  const carouselRef = useRef<HTMLElement>(null)
  const isInView = useInView(carouselRef, { once: true, amount: 0.52 })
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    if (isInView) setHasEntered(true)
  }, [isInView])

  const entranceDelay = (distance: number) => 0.08 + Math.min(Math.abs(distance), 3) * 0.11

  const entranceRotation = (distance: number, seed: string) => {
    const variation = (Array.from(seed).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 9) - 4
    return distance === 0 ? variation : Math.sign(distance) * (8 + Math.abs(distance) * 3) + variation
  }

  return { carouselRef, hasEntered, entranceDelay, entranceRotation }
}
