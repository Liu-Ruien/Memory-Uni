import { motion, useReducedMotion } from 'framer-motion'
import { appleEaseOut, appleSpring } from '../design/motion'

const heroPhotoSrc = '/images/photo-together.jpg'

export function LandingPage() {
  const reduceMotion = useReducedMotion()

  const scrollToMemories = () => {
    document.getElementById('memory-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-start overflow-hidden px-4 pb-8 pt-[92px] text-center sm:px-8 sm:pb-10 sm:pt-[88px] lg:px-12"
      aria-labelledby="landing-title"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-center">
        <motion.figure
          className="liquid-photo-frame relative w-[min(100%,calc((100svh-368px)*2.15))] max-w-[1120px] rounded-[22px] p-1.5 sm:rounded-[32px] sm:p-2.5"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(18px) scale(0.985)' }}
          animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
          transition={reduceMotion ? { duration: 0.2, ease: appleEaseOut } : appleSpring}
          data-motion-transform="true"
        >
          <div className="relative aspect-[2.15/1] overflow-hidden rounded-[17px] bg-[#d7d7d2] sm:rounded-[25px]">
            <img
              src={heroPhotoSrc}
              alt="朋友们在校园里留下的毕业合照"
              className="h-full w-full object-contain"
              fetchPriority="high"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.05]" aria-hidden="true" />
          </div>

          <figcaption className="liquid-glass-chip absolute bottom-4 left-4 hidden rounded-full px-3.5 py-2 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-secondary)] sm:block">
            Linyi University · 2022—2026
          </figcaption>
        </motion.figure>

        <motion.div
          className="mx-auto mt-6 flex max-w-3xl flex-col items-center sm:mt-8"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.08, ease: appleEaseOut }}
          data-motion-transform="true"
        >
          <p className="apple-kicker">属于我们的共同回忆</p>

          <h1
            id="landing-title"
            className="mt-3 text-[clamp(2rem,4.6vw,4.15rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--page-fg)] sm:mt-4"
          >
            那年，我们恰好同行。
          </h1>

          <p className="apple-secondary-text mt-3 text-[13px] leading-6 tracking-[-0.005em] sm:mt-4 sm:text-[15px] sm:leading-7">
            照片留住的，不只是毕业这一天，
            <br />
            还有一起走过的四年。
          </p>

          <button type="button" onClick={scrollToMemories} className="apple-primary-button group mt-5 inline-flex items-center gap-2.5 sm:mt-6">
            开始回忆
            <svg className="apple-button-arrow size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
