import { motion } from 'framer-motion'
import type { Photo } from '../data/photos'

interface LandingPageProps {
  photos: Photo[]
}

const backgroundLayouts = [
  'left-[-7%] top-[10%] hidden w-[28vw] max-w-[360px] -rotate-[7deg] sm:block',
  'right-[-15%] top-[9%] w-[48vw] max-w-[410px] rotate-[6deg] sm:right-[-7%] sm:w-[30vw]',
  'bottom-[4%] left-[-16%] w-[52vw] max-w-[430px] rotate-[5deg] sm:left-[-5%] sm:w-[31vw]',
  'bottom-[-10%] right-[3%] hidden w-[27vw] max-w-[350px] -rotate-[5deg] md:block',
]

export function LandingPage({ photos }: LandingPageProps) {
  const scrollToMemories = () => {
    document.getElementById('memory-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f0ede6] px-6 pb-10 pt-24 text-center dark:bg-[#11110f] sm:px-10"
      aria-labelledby="landing-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {photos.slice(0, 4).map((photo, index) => (
          <motion.div
            key={photo.id}
            className={`absolute aspect-[3/4] overflow-hidden rounded-[28px] opacity-0 shadow-[0_24px_70px_rgba(63,48,31,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${backgroundLayouts[index]}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: index === 0 || index === 3 ? 0.14 : 0.2, scale: 1 }}
            transition={{ duration: 1.05, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={photo.src} alt="" className="h-full w-full scale-[1.04] object-cover blur-[1.5px] saturate-[0.72] dark:brightness-[0.58] dark:saturate-[0.55]" />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-[#f0ede6]/38 dark:bg-[#11110f]/42" />
        <div className="absolute left-1/2 top-1/2 h-[58%] w-[78%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f3f0e9]/80 blur-[70px] dark:bg-[#11110f]/82" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        <motion.p
          className="mb-7 text-[10px] font-semibold tracking-[0.28em] text-neutral-500 dark:text-neutral-500 sm:mb-9 sm:text-[11px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          关于时间，也关于我们
        </motion.p>

        <motion.h1
          id="landing-title"
          className="text-[clamp(2.35rem,9vw,5.3rem)] font-medium leading-[1.08] tracking-[-0.055em] text-neutral-950 dark:text-[#f3f0e9]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          有些时光，
          <br />
          值得被好好记住。
        </motion.h1>

        <motion.p
          className="mt-8 text-[13px] leading-7 tracking-[0.015em] text-neutral-600 dark:text-neutral-400 sm:mt-10 sm:text-[15px] sm:leading-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.42, ease: 'easeOut' }}
        >
          照片留下的，
          <br />
          从来不只是某一个瞬间，
          <br />
          而是我们曾经真实生活过的证明。
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center sm:mt-11"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.66, ease: 'easeOut' }}
        >
          <button
            type="button"
            onClick={scrollToMemories}
            className="group flex items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 text-[13px] font-medium text-white shadow-[0_10px_30px_rgba(25,22,17,0.14)] transition-transform duration-300 hover:scale-[1.025] active:scale-[0.985] dark:bg-[#efede7] dark:text-neutral-900"
          >
            开始回忆
            <span className="text-sm transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true">↓</span>
          </button>
          <span className="mt-4 text-[9px] tracking-[0.18em] text-neutral-400 dark:text-neutral-600">向下，回到那些日子</span>
        </motion.div>
      </div>
    </section>
  )
}
