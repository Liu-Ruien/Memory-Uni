import { motion } from 'framer-motion'

const heroPhotoSrc = '/images/photo-together.jpg'

export function LandingPage() {
  const scrollToMemories = () => {
    document.getElementById('memory-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#f1eee7] px-4 pb-10 pt-[88px] text-center dark:bg-[#11110f] sm:px-8 sm:pb-14 sm:pt-24 lg:px-12"
      aria-labelledby="landing-title"
    >
      <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center justify-center">
        <motion.div
          className="mx-auto flex max-w-5xl flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[9px] font-semibold tracking-[0.24em] text-neutral-500 dark:text-neutral-500 sm:text-[10px]">
            属于我们的共同回忆
          </p>

          <h1
            id="landing-title"
            className="mt-5 text-[clamp(2.15rem,6.8vw,5.15rem)] font-medium leading-[1.06] tracking-[-0.055em] text-neutral-950 dark:text-[#f3f0e9] sm:mt-6"
          >
            那些一起走过的日子，
            <br />
            终会成为珍贵的回忆
          </h1>

          <p className="mt-5 text-[13px] leading-6 tracking-[0.01em] text-neutral-600 dark:text-neutral-400 sm:mt-7 sm:text-[15px] sm:leading-7">
            与你的朋友一起，
            <br className="sm:hidden" />
            保存属于你们的青春瞬间。
          </p>

          <button
            type="button"
            onClick={scrollToMemories}
            className="group mt-6 flex min-h-12 items-center gap-3 rounded-full bg-neutral-950 px-6 text-[13px] font-medium text-white shadow-[0_12px_34px_rgba(27,23,17,0.14)] transition-transform duration-300 hover:scale-[1.018] active:scale-[0.985] dark:bg-[#f1efe9] dark:text-neutral-950 sm:mt-8 sm:px-7"
          >
            开始回忆
            <span className="text-sm transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true">↓</span>
          </button>
        </motion.div>

        <motion.figure
          className="relative mt-7 aspect-[2.15/1] w-full overflow-hidden rounded-[22px] bg-[#d8d4cb] shadow-[0_24px_70px_rgba(47,39,27,0.13)] ring-1 ring-black/[0.06] will-change-transform dark:bg-[#1b1b18] dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] dark:ring-white/[0.08] sm:mt-10 sm:rounded-[30px]"
          initial={{ opacity: 0, y: 22, rotate: -0.35, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, rotate: -0.2, scale: 1 }}
          whileHover={{ y: -5, rotate: 0, scale: 1.004 }}
          transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.9, delay: 0.12 }}
        >
          <img
            src={heroPhotoSrc}
            alt="朋友们在校园里留下的毕业合照"
            className="h-full w-full object-contain"
            fetchPriority="high"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" aria-hidden="true" />
        </motion.figure>
      </div>
    </section>
  )
}
