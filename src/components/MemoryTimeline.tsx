import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { academicYears, type AcademicYear, type AcademicYearId } from '../data/academicYears'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleSpring } from '../design/motion'
import { MemoryFolderPreview } from './MemoryFolderPreview'

interface TimelinePhotoGroup {
  year: AcademicYear
  photos: Photo[]
}

interface MemoryTimelineProps {
  photoGroups: TimelinePhotoGroup[]
  isLoading: boolean
  onSelectYear: (yearId: AcademicYearId) => void
}

const verticalOffsets = ['mt-1', 'mt-[72px]', 'mt-6', 'mt-[86px]']
const folderAccents = [
  { tint: 'rgba(230, 211, 173, 0.82)', glow: 'rgba(231, 197, 130, 0.32)' },
  { tint: 'rgba(188, 220, 239, 0.82)', glow: 'rgba(121, 196, 240, 0.3)' },
  { tint: 'rgba(218, 199, 235, 0.82)', glow: 'rgba(186, 137, 226, 0.28)' },
  { tint: 'rgba(195, 225, 194, 0.82)', glow: 'rgba(123, 201, 130, 0.28)' },
]

export function MemoryTimeline({ photoGroups, isLoading, onSelectYear }: MemoryTimelineProps) {
  const reduceMotion = useReducedMotion()
  const photosByYear = new Map(photoGroups.map(({ year, photos }) => [year.id, photos]))

  return (
    <section
      id="memory-section"
      className="memory-paper relative isolate scroll-mt-0 overflow-visible px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32 lg:px-12"
      aria-labelledby="timeline-heading"
    >
      <div className="relative z-10 mx-auto max-w-[1320px]">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.5, ease: appleEaseOut }}
          data-motion-transform="true"
        >
          <p className="apple-kicker">2022—2026</p>
          <h2
            id="timeline-heading"
            className="mt-4 text-[clamp(2.35rem,5vw,4.8rem)] font-semibold leading-[1.02] tracking-[-0.058em] text-[var(--page-fg)]"
          >
            四年，写成一条路。
          </h2>
          <p className="apple-secondary-text mx-auto mt-5 max-w-lg text-sm leading-7 sm:text-base">
            打开一个文件夹，就回到那一年。
          </p>
        </motion.div>

        <div className="-mx-5 mt-8 overflow-x-auto px-5 py-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:mt-14 sm:px-8 lg:mx-0 lg:overflow-visible lg:px-10">
          <div className="relative mx-auto h-[388px] min-w-[940px] max-w-[1180px]">
            <svg
              className="pointer-events-none absolute inset-x-0 top-9 h-[265px] w-full overflow-visible text-[var(--timeline-path)]"
              viewBox="0 0 1000 265"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <motion.path
                d="M125 64 C220 64 270 153 375 153 S515 91 625 91 S770 178 875 178"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeDasharray="5 9"
                strokeLinecap="round"
                initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: reduceMotion ? 0.2 : 0.9, delay: reduceMotion ? 0 : 0.1, ease: appleEaseOut }}
              />
              {[{ x: 125, y: 64 }, { x: 375, y: 153 }, { x: 625, y: 91 }, { x: 875, y: 178 }].map((point) => (
                <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="var(--page-bg)" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>

            <div className="relative grid h-full grid-cols-4 gap-10 px-8">
              {academicYears.map((year, index) => {
                const photos = photosByYear.get(year.id) ?? []
                const countLabel = isLoading ? '正在整理' : photos.length === 0 ? '空文件夹' : `${photos.length} 张照片`
                const folderStyle = {
                  '--folder-tint': folderAccents[index].tint,
                  '--folder-glow': folderAccents[index].glow,
                } as CSSProperties

                return (
                  <motion.button
                    key={year.id}
                    type="button"
                    onClick={() => onSelectYear(year.id)}
                    className={`${verticalOffsets[index]} memory-folder group relative h-[238px] text-left text-neutral-900 outline-none will-change-transform dark:text-white`}
                    style={folderStyle}
                    initial={reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, transform: `translateY(18px) rotate(${year.rotation}deg) scale(0.985)` }}
                    whileInView={{ opacity: 1, transform: `translateY(0px) rotate(${year.rotation}deg) scale(1)` }}
                    viewport={{ once: true, amount: 0.45 }}
                    whileHover={reduceMotion ? undefined : { transform: 'translateY(-7px) rotate(0deg) scale(1.018)' }}
                    whileTap={reduceMotion ? { opacity: 0.82 } : { transform: 'translateY(-2px) rotate(0deg) scale(0.98)' }}
                    transition={{ ...appleSpring, delay: reduceMotion ? 0 : index * 0.055 }}
                    data-motion-transform="true"
                    aria-label={`打开${year.title}文件夹，${countLabel}`}
                  >
                    <span className="memory-folder-ambient" aria-hidden="true" />
                    <span className="memory-folder-hover-shadow" aria-hidden="true" />
                    <span className="memory-folder-back" aria-hidden="true" />
                    <span className="memory-folder-tab" aria-hidden="true">
                      <span>MEMORIES</span>
                    </span>

                    <MemoryFolderPreview photos={photos} isLoading={isLoading} />

                    <span className="memory-folder-front">
                      <span className="flex items-start justify-between gap-4">
                        <span>
                          <span className="block text-[10px] font-semibold tracking-[0.14em] text-black/45 dark:text-white/48">{year.number}</span>
                          <span className="mt-2 block text-[18px] font-semibold tracking-[-0.035em]">{year.title}</span>
                        </span>
                        <svg className="memory-folder-arrow mt-1 size-4 shrink-0 text-black/48 dark:text-white/52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 17 17 7M8 7h9v9" />
                        </svg>
                      </span>
                      <span className="mt-3 flex items-center justify-between gap-3 text-[10px] font-medium text-black/46 dark:text-white/50">
                        <span>{year.period}</span>
                        <span className="tabular-nums">{countLabel}</span>
                      </span>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
