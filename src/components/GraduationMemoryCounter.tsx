import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import LiquidGlass from 'liquid-glass-react'
import { useEffect, useState } from 'react'
import { appleEaseOut, appleSpring } from '../design/motion'

interface GraduationMemoryCounterProps {
  graduationDate?: string
}

const defaultGraduationDate = '2026-06-18T00:00:00+08:00'
const millisecondsPerDay = 86_400_000
function getElapsedDays(graduationDate: string) {
  const graduationTime = new Date(graduationDate).getTime()
  if (!Number.isFinite(graduationTime)) return 0
  return Math.floor(Math.max(0, Date.now() - graduationTime) / millisecondsPerDay)
}

function getMillisecondsUntilNextDay(graduationDate: string) {
  const graduationTime = new Date(graduationDate).getTime()
  if (!Number.isFinite(graduationTime)) return millisecondsPerDay
  const elapsed = Math.max(0, Date.now() - graduationTime)
  return Math.max(60_000, millisecondsPerDay - (elapsed % millisecondsPerDay) + 1_000)
}

function canUseFullLiquidGlass() {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent
  const isFirefox = /Firefox|FxiOS/i.test(userAgent)
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR/i.test(userAgent)
  const isIOSWebKit = /iPad|iPhone|iPod/i.test(userAgent)
  const supportsBackdrop = window.CSS?.supports?.('backdrop-filter', 'blur(2px)')
    || window.CSS?.supports?.('-webkit-backdrop-filter', 'blur(2px)')

  return Boolean(supportsBackdrop && !isFirefox && !isSafari && !isIOSWebKit)
}

function useLiquidGlassSupport() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const reduceTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)')
    const updateSupport = () => setIsSupported(canUseFullLiquidGlass() && !reduceTransparency.matches)

    updateSupport()
    reduceTransparency.addEventListener('change', updateSupport)
    return () => reduceTransparency.removeEventListener('change', updateSupport)
  }, [])

  return isSupported
}

function AnimatedDayValue({ value }: { value: number }) {
  const reduceMotion = useReducedMotion()

  return (
    <span className="graduation-day-value relative inline-grid min-w-[2ch] place-items-center overflow-hidden tabular-nums">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24%) scale(0.99)' }}
          animate={{ opacity: 1, transform: 'translateY(0%) scale(1)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-24%) scale(0.99)' }}
          transition={reduceMotion ? { duration: 0.12, ease: appleEaseOut } : appleSpring}
          data-motion-transform="true"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

interface CounterContentProps {
  elapsedDays: number
  fallback?: boolean
}

function CounterContent({ elapsedDays, fallback = false }: CounterContentProps) {
  return (
    <section
      className={`graduation-memory-content w-full rounded-[28px] px-6 py-6 sm:rounded-[30px] sm:px-7 sm:py-7 ${fallback ? 'graduation-memory-card' : ''}`}
      aria-label={`已毕业 ${elapsedDays} 天，2026年6月18日至今`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[13px] font-semibold tracking-[-0.015em] text-[var(--page-fg)] sm:text-sm">已毕业</h2>
        <span className="graduation-memory-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-4 9 4-9 4-9-4Z" />
            <path d="M7 11.5V16c2.8 2 7.2 2 10 0v-4.5M21 9v6" />
          </svg>
        </span>
      </div>

      <div className="graduation-day-lockup mt-4 flex items-end gap-2" role="timer">
        <AnimatedDayValue value={elapsedDays} />
        <span className="graduation-day-label pb-1.5">天</span>
      </div>

      <p className="graduation-date-range mt-4 text-[10px] font-medium tracking-[0.08em] text-[var(--text-tertiary)]">
        2026.06.18 — 至今
      </p>
    </section>
  )
}

export function GraduationMemoryCounter({ graduationDate = defaultGraduationDate }: GraduationMemoryCounterProps) {
  const reduceMotion = useReducedMotion()
  const supportsLiquidGlass = useLiquidGlassSupport()
  const [elapsedDays, setElapsedDays] = useState(() => getElapsedDays(graduationDate))

  useEffect(() => {
    let timeoutId = 0

    const updateElapsedDays = () => {
      setElapsedDays(getElapsedDays(graduationDate))
      timeoutId = window.setTimeout(updateElapsedDays, getMillisecondsUntilNextDay(graduationDate))
    }

    updateElapsedDays()
    return () => window.clearTimeout(timeoutId)
  }, [graduationDate])

  return (
    <motion.div
      className="graduation-counter-shell mx-auto w-full max-w-[360px]"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px) scale(0.99)' }}
      whileInView={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.25, ease: appleEaseOut }}
      data-motion-transform="true"
    >
      <motion.div
        className="graduation-counter-interaction"
        data-motion-transform="true"
      >
        {supportsLiquidGlass && !reduceMotion ? (
          <div className="graduation-liquid-host">
            <LiquidGlass
              className="graduation-liquid-glass"
              displacementScale={20}
              blurAmount={0.02}
              saturation={102}
              aberrationIntensity={0.12}
              elasticity={0}
              cornerRadius={30}
              padding="0px"
              overLight={false}
              mode="standard"
              style={{ position: 'absolute', top: '50%', left: '50%', width: '100%' }}
            >
              <CounterContent elapsedDays={elapsedDays} />
            </LiquidGlass>
          </div>
        ) : (
          <CounterContent elapsedDays={elapsedDays} fallback />
        )}
      </motion.div>
    </motion.div>
  )
}
