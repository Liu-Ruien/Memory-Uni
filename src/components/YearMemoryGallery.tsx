import { motion, useReducedMotion } from 'framer-motion'
import type { AcademicYear } from '../data/academicYears'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleGestureSpring } from '../design/motion'

interface YearMemoryGalleryProps {
  year: AcademicYear
  photos: Photo[]
  onSelect: (photoId: string) => void
  isLast?: boolean
}

function hasMeaningfulTitle(photo: Photo) {
  const title = photo.title.trim()
  return Boolean(
    title
    && title !== '未命名回忆'
    && title !== '拍摄时间未知'
    && !title.startsWith('拍摄于 '),
  )
}

export function YearMemoryGallery({ year, photos, onSelect, isLast = false }: YearMemoryGalleryProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id={`year-${year.id}`}
      className={`archive-year-section ${
        isLast ? 'is-last' : ''
      }`}
      aria-labelledby={`year-${year.id}-heading`}
    >
      <div className={`archive-year-shell archive-year-${year.id}`}>
        <motion.div
          className="archive-year-heading"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
          viewport={{ once: true, amount: 0.65 }}
          transition={{ duration: 0.45, ease: appleEaseOut }}
          data-motion-transform="true"
        >
          <div>
            <h2 id={`year-${year.id}-heading`}>
              {year.title}
            </h2>
            <p>{year.description}</p>
          </div>
          <span className="archive-year-count tabular-nums" aria-label={`共 ${photos.length} 张照片`}>
            <strong>{String(photos.length).padStart(2, '0')}</strong>
            <small>张照片</small>
          </span>
        </motion.div>

        {photos.length > 0 ? (
          <div className="memory-masonry relative z-10">
            {photos.map((photo, index) => {
              const showTitle = hasMeaningfulTitle(photo)

              return (
                <motion.button
                  key={photo.id}
                  layoutId={`memory-photo-${photo.id}`}
                  type="button"
                  onClick={() => onSelect(photo.id)}
                  className="memory-masonry-item memory-photo-card group relative block w-full break-inside-avoid overflow-hidden text-left"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(10px)' }}
                  whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
                  viewport={{ once: true, margin: '-32px' }}
                  whileTap={reduceMotion ? { opacity: 0.82 } : { transform: 'scale(0.985)' }}
                  transition={{
                    layout: appleGestureSpring,
                    opacity: { duration: 0.3, delay: reduceMotion ? 0 : (index % 4) * 0.035, ease: appleEaseOut },
                    transform: { duration: 0.3, delay: reduceMotion ? 0 : (index % 4) * 0.035, ease: appleEaseOut },
                  }}
                  data-motion-transform="true"
                  aria-label={`查看照片：${showTitle ? photo.title : `${year.title}的共同回忆`}`}
                >
                  <img src={photo.src} alt={`${year.title}的共同回忆`} loading="lazy" decoding="async" className="memory-photo-image block h-auto w-full select-none" draggable={false} />
                  {showTitle && (
                    <span className="memory-photo-overlay pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3 pt-14 text-white sm:px-4 sm:pb-4" aria-hidden="true">
                      <span className="block truncate text-[12px] font-semibold tracking-[-0.01em]">{photo.title}</span>
                    </span>
                  )}
                  <span className="registration-cross is-top-left" aria-hidden="true" />
                </motion.button>
              )
            })}
          </div>
        ) : (
          <motion.div
            className="archive-year-empty"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.25, ease: appleEaseOut }}
          >
            <p className="text-sm leading-7">这一年的故事还在等待照片。</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
