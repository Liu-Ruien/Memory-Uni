import { motion } from 'framer-motion'
import type { Photo } from '../data/photos'

interface LandingPageProps {
  photos: Photo[]
  isLoading: boolean
  onStart: () => void
}

export function LandingPage({ photos, isLoading, onStart }: LandingPageProps) {
  const heroPhoto = photos[0]

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#f1eee7] px-4 pb-8 pt-[88px] text-center dark:bg-[#11110f] sm:px-8 sm:pb-10 sm:pt-24 lg:px-12"
      aria-labelledby="landing-title"
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center">
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[9px] font-semibold tracking-[0.24em] text-neutral-500 dark:text-neutral-500 sm:text-[10px]">
            属于我们的共同回忆
          </p>

          <h1
            id="landing-title"
            className="mt-5 text-[clamp(2.25rem,7vw,5.1rem)] font-medium leading-[1.06] tracking-[-0.055em] text-neutral-950 dark:text-[#f3f0e9] sm:mt-6"
          >
            那些一起走过的日子
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
            onClick={onStart}
            className="group mt-6 flex min-h-12 items-center gap-3 rounded-full bg-neutral-950 px-6 text-[13px] font-medium text-white shadow-[0_12px_34px_rgba(27,23,17,0.15)] transition-transform duration-300 hover:scale-[1.018] active:scale-[0.985] dark:bg-[#f1efe9] dark:text-neutral-950 sm:mt-8 sm:px-7"
          >
            开始回忆
            <span className="text-base font-light transition-transform duration-300 group-hover:rotate-90" aria-hidden="true">＋</span>
          </button>
        </motion.div>

        <motion.figure
          className="relative mt-7 aspect-[2.15/1] w-full overflow-hidden rounded-[22px] bg-[#d7d2c8] shadow-[0_22px_70px_rgba(49,40,27,0.12)] ring-1 ring-black/[0.05] dark:bg-[#1b1b18] dark:shadow-[0_28px_80px_rgba(0,0,0,0.36)] dark:ring-white/[0.07] sm:mt-10 sm:rounded-[30px]"
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroPhoto ? (
            <>
              <img
                src={heroPhoto.src}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl saturate-75 dark:opacity-20 dark:brightness-50"
                aria-hidden="true"
              />
              <img
                src={heroPhoto.src}
                alt="朋友们一起留下的青春合照"
                className="relative h-full w-full object-contain"
                fetchPriority="high"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" aria-hidden="true" />
            </>
          ) : (
            <div className="grid h-full w-full place-items-center px-6">
              <p className="text-[10px] tracking-[0.12em] text-neutral-500/80 dark:text-neutral-500">
                {isLoading ? '共同回忆正在慢慢浮现…' : '上传一张合照，故事从这里开始。'}
              </p>
            </div>
          )}
        </motion.figure>
      </div>
    </section>
  )
}
