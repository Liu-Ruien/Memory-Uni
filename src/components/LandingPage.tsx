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
      className="relative flex min-h-[100svh] items-start overflow-hidden bg-[#f1eee7] px-4 pb-7 pt-[104px] text-center dark:bg-[#11110f] sm:px-8 sm:pb-9 sm:pt-[92px] lg:px-12"
      aria-labelledby="landing-title"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-center">
        <motion.div
          className="relative w-[min(100%,calc((100svh-388px)*2.15))] max-w-[1090px]"
          initial={{ opacity: 0, y: 22, rotate: -0.7, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, rotate: -0.35, scale: 1 }}
          transition={{ type: 'spring', stiffness: 115, damping: 22, mass: 0.9 }}
        >
          <motion.svg
            className="pointer-events-none absolute -left-1 -top-7 z-20 h-[78px] w-[78px] text-neutral-700 dark:text-neutral-300 sm:-left-8 sm:-top-10 sm:h-[112px] sm:w-[112px]"
            viewBox="0 0 120 120"
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ duration: 42, ease: 'linear', repeat: Number.POSITIVE_INFINITY }}
          >
            <defs>
              <path id="memory-stamp-path" d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0" />
            </defs>
            <text className="fill-current text-[8px] font-medium uppercase tracking-[0.19em]">
              <textPath href="#memory-stamp-path">
                LINYI UNIVERSITY · OUR MEMORIES · 2022—2026 ·
              </textPath>
            </text>
          </motion.svg>

          <motion.figure
            className="relative rounded-[18px] bg-[#fffdf8] p-2 shadow-[0_26px_70px_rgba(54,45,31,0.17)] ring-1 ring-black/[0.06] will-change-transform dark:bg-[#e8e4db] dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:rounded-[26px] sm:p-3"
            whileHover={{ y: -5, rotate: 0.35, scale: 1.003 }}
            transition={{ type: 'spring', stiffness: 150, damping: 22, mass: 0.85 }}
          >
            <div className="relative aspect-[2.15/1] overflow-hidden rounded-[12px] bg-[#d8d4cb] sm:rounded-[18px]">
              <img
                src={heroPhotoSrc}
                alt="朋友们在校园里留下的毕业合照"
                className="h-full w-full object-contain"
                fetchPriority="high"
                decoding="async"
              />
              <div
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20"
                aria-hidden="true"
              />
            </div>
          </motion.figure>

          <svg
            className="pointer-events-none absolute -right-2 top-1/2 z-20 h-12 w-20 -translate-y-1/2 text-neutral-500/70 dark:text-neutral-500 sm:-right-12 sm:h-16 sm:w-28"
            viewBox="0 0 112 64"
            fill="none"
            aria-hidden="true"
          >
            {[14, 27, 40, 53].map((y) => (
              <path
                key={y}
                d={`M4 ${y} C18 ${y - 7}, 28 ${y + 7}, 42 ${y} S66 ${y - 7}, 80 ${y} S99 ${y + 7}, 108 ${y}`}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </motion.div>

        <motion.div
          className="mx-auto mt-5 flex max-w-3xl flex-col items-center sm:mt-7"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[9px] font-semibold tracking-[0.24em] text-neutral-500 dark:text-neutral-500 sm:text-[10px]">
            属于我们的共同回忆
          </p>

          <h1
            id="landing-title"
            className="mt-3 text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1.05] tracking-[-0.05em] text-neutral-950 dark:text-[#f3f0e9] sm:mt-4"
          >
            那年，我们恰好同行。
          </h1>

          <p className="mt-3 text-[13px] leading-6 tracking-[0.01em] text-neutral-600 dark:text-neutral-400 sm:mt-4 sm:text-[15px] sm:leading-7">
            照片留住的，不只是毕业这一天，
            <br />
            还有一起走过的四年。
          </p>

          <button
            type="button"
            onClick={scrollToMemories}
            className="group mt-4 flex min-h-11 items-center gap-3 rounded-full bg-neutral-950 px-6 text-[13px] font-medium text-white shadow-[0_12px_34px_rgba(27,23,17,0.14)] transition-transform duration-300 hover:scale-[1.018] active:scale-[0.985] dark:bg-[#f1efe9] dark:text-neutral-950 sm:mt-5 sm:min-h-12 sm:px-7"
          >
            开始回忆
            <span
              className="text-sm transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden="true"
            >
              ↓
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
