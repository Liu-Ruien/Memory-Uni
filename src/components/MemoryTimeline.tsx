import { motion } from 'framer-motion'
import { academicYears, type AcademicYearId } from '../data/academicYears'

interface MemoryTimelineProps {
  onSelectYear: (yearId: AcademicYearId) => void
}

const verticalOffsets = ['mt-1', 'mt-[76px]', 'mt-7', 'mt-[92px]']

export function MemoryTimeline({ onSelectYear }: MemoryTimelineProps) {
  return (
    <section
      id="memory-section"
      className="scroll-mt-0 overflow-hidden px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32 lg:px-12"
      aria-labelledby="timeline-heading"
    >
      <div className="mx-auto max-w-[1320px]">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-semibold tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
            2022—2026
          </p>
          <h2
            id="timeline-heading"
            className="mt-4 text-[clamp(2.3rem,5vw,4.8rem)] font-medium leading-none tracking-[-0.055em] text-neutral-950 dark:text-[#f4f2ed]"
          >
            四年，写成一条路。
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-neutral-500 dark:text-neutral-400 sm:text-base">
            从初见到出发，每一年都有一些瞬间，值得重新走近。
          </p>
        </motion.div>

        <div className="-mx-5 mt-14 overflow-x-auto px-5 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:mt-20 sm:px-8 lg:mx-0 lg:px-0">
          <div className="relative mx-auto h-[330px] min-w-[900px] max-w-[1180px]">
            <svg
              className="pointer-events-none absolute inset-x-0 top-7 h-[245px] w-full overflow-visible text-neutral-300 dark:text-neutral-700"
              viewBox="0 0 1000 245"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <motion.path
                d="M125 64 C220 64 270 143 375 143 S515 87 625 87 S770 166 875 166"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="7 10"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
              {[{ x: 125, y: 64 }, { x: 375, y: 143 }, { x: 625, y: 87 }, { x: 875, y: 166 }].map((point) => (
                <circle
                  key={`${point.x}-${point.y}`}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="var(--page-bg)"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div className="relative grid h-full grid-cols-4 gap-8 px-5">
              {academicYears.map((year, index) => (
                <motion.button
                  key={year.id}
                  type="button"
                  onClick={() => onSelectYear(year.id)}
                  className={`${verticalOffsets[index]} ${year.cardClassName} group relative h-[194px] rounded-[24px] border border-black/[0.055] p-6 text-left text-neutral-900 shadow-[0_16px_40px_rgba(48,42,31,0.08)] outline-none dark:border-white/[0.07] dark:text-neutral-100 dark:shadow-[0_20px_50px_rgba(0,0,0,0.22)]`}
                  initial={{ opacity: 0, y: 24, rotate: year.rotation }}
                  whileInView={{ opacity: 1, y: 0, rotate: year.rotation }}
                  viewport={{ once: true, amount: 0.45 }}
                  whileHover={{ y: -7, scale: 1.03, rotate: 0, boxShadow: '0 24px 56px rgba(48, 42, 31, 0.16)' }}
                  whileTap={{ scale: 0.985, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 170, damping: 21, delay: index * 0.07 }}
                  aria-label={`查看${year.title}的照片`}
                >
                  <span className="block font-serif text-[13px] tracking-[0.16em] text-neutral-500/80 dark:text-neutral-400">
                    {year.number}
                  </span>
                  <span className="mt-7 block text-xl font-medium tracking-[-0.035em]">
                    {year.title}
                  </span>
                  <span className="mt-3 block text-[11px] leading-5 text-neutral-600 dark:text-neutral-400">
                    {year.description}
                  </span>
                  <span className="absolute bottom-5 right-5 text-sm text-neutral-500 transition-transform duration-300 group-hover:translate-x-1 dark:text-neutral-400" aria-hidden="true">
                    ↘
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
