import { motion, useReducedMotion } from 'framer-motion'
import { academicYears, type AcademicYear, type AcademicYearId } from '../data/academicYears'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleSpring } from '../design/motion'

interface TimelinePhotoGroup {
  year: AcademicYear
  photos: Photo[]
}

interface MemoryYearWallProps {
  photoGroups: TimelinePhotoGroup[]
  isLoading: boolean
  onSelectYear: (yearId: AcademicYearId) => void
}

const paneAccents = ['is-cobalt', 'is-clear', 'is-amber', 'is-oxblood']

export function MemoryYearWall({ photoGroups, isLoading, onSelectYear }: MemoryYearWallProps) {
  const reduceMotion = useReducedMotion()
  const photosByYear = new Map(photoGroups.map(({ year, photos }) => [year.id, photos]))

  return (
    <section id="memory-section" className="year-wall-section" aria-labelledby="timeline-heading">
      <div className="year-wall-heading">
        <div>
          <h2 id="timeline-heading">沿着四年，慢慢走回去。</h2>
          <p>每一格都是真实照片。先选一年，也可以一直往下看。</p>
        </div>
        <span className="year-wall-range tabular-nums">2022—2026</span>
      </div>

      <div className="year-glass-wall">
        {academicYears.map((year, index) => {
          const yearPhotos = photosByYear.get(year.id) ?? []
          const preview = yearPhotos[0]
          const countLabel = isLoading ? '正在整理' : `${String(yearPhotos.length).padStart(2, '0')} 张照片`

          return (
            <motion.button
              key={year.id}
              type="button"
              onClick={() => onSelectYear(year.id)}
              className={`year-glass-pane ${paneAccents[index]}`}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)', filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.3 }}
              whileTap={reduceMotion ? { opacity: 0.82 } : { scale: 0.985 }}
              transition={{ ...appleSpring, delay: reduceMotion ? 0 : index * 0.055 }}
              data-motion-transform="true"
              aria-label={`浏览${year.title}，${countLabel}`}
            >
              <span className="year-pane-media" aria-hidden="true">
                {preview ? (
                  <img src={preview.src} alt="" loading="lazy" decoding="async" draggable={false} />
                ) : (
                  <span className={`year-pane-empty${isLoading ? ' is-loading' : ''}`} />
                )}
                <span className="year-pane-glass" />
              </span>
              <span className="year-pane-topline">
                <span className="year-pane-number tabular-nums">{year.number}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 18 18 6M8 6h10v10" />
                </svg>
              </span>
              <span className="year-pane-copy">
                <strong>{year.title}</strong>
                <small>{year.description}</small>
              </span>
              <span className="year-pane-count tabular-nums">{countLabel}</span>
              <span className="registration-cross is-top-left" aria-hidden="true" />
            </motion.button>
          )
        })}
      </div>

      <motion.p
        className="year-wall-footnote"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.35, ease: appleEaseOut }}
      >
        四个阶段可以自由打开，也可以沿着页面顺序慢慢看完。
      </motion.p>
    </section>
  )
}
