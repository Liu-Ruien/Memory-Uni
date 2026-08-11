import { motion, useReducedMotion } from 'framer-motion'
import type { AcademicYear } from '../data/academicYears'
import type { Photo } from '../data/photos'
import { appleEaseOut, appleGestureSpring } from '../design/motion'
import { formatTakenAt } from '../lib/photoTakenAt'

interface YearMemoryGalleryProps {
  year: AcademicYear
  photos: Photo[]
  onSelect: (photoId: string) => void
}

function hasMeaningfulTitle(photo: Photo) {
  return Boolean(photo.title.trim() && photo.title !== '未命名回忆')
}

export function YearMemoryGallery({ year, photos, onSelect }: YearMemoryGalleryProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id={`year-${year.id}`}
      className="mx-auto max-w-[1380px] scroll-mt-20 px-3 py-9 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      aria-labelledby={`year-${year.id}-heading`}
    >
      <div className={`spatial-album-layer spatial-album-${year.id} relative overflow-hidden rounded-[28px] px-4 py-7 sm:rounded-[36px] sm:px-8 sm:py-10 lg:px-10 lg:py-12`}>
        <motion.div
          className="relative z-10 mb-10 flex items-end justify-between gap-6 sm:mb-14"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
          viewport={{ once: true, amount: 0.65 }}
          transition={{ duration: 0.45, ease: appleEaseOut }}
          data-motion-transform="true"
        >
          <div>
            <p className="apple-kicker">{year.period}</p>
            <h2 id={`year-${year.id}-heading`} className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-fg)] sm:text-5xl">
              {year.title}
            </h2>
            <p className="apple-secondary-text mt-4 max-w-md text-xs leading-6 sm:text-sm">{year.description}</p>
          </div>
          <span className="spatial-album-count apple-secondary-text mb-1 inline-grid min-w-11 place-items-center rounded-full px-3 py-2 text-[11px] tabular-nums" aria-label={`共 ${photos.length} 张照片`}>
            {String(photos.length).padStart(2, '0')}
          </span>
        </motion.div>

        {photos.length > 0 ? (
          <div className="memory-masonry relative z-10">
            {photos.map((photo, index) => {
              const takenAt = formatTakenAt(photo.takenAt)
              const showTitle = hasMeaningfulTitle(photo)

              return (
                <motion.button
                  key={photo.id}
                  layoutId={`memory-photo-${photo.id}`}
                  type="button"
                  onClick={() => onSelect(photo.id)}
                  className="memory-masonry-item memory-photo-card group relative block w-full break-inside-avoid overflow-hidden rounded-[16px] bg-[var(--surface-muted)] text-left shadow-[var(--shadow-small)] sm:rounded-[22px]"
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
                  aria-label={`查看照片：${showTitle ? photo.title : takenAt ? `拍摄于 ${takenAt}` : '拍摄时间未知'}`}
                >
                  <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="memory-photo-image block h-auto w-full select-none" draggable={false} />
                  {(showTitle || takenAt) && (
                    <span className="memory-photo-overlay pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3 pt-14 text-white sm:px-4 sm:pb-4" aria-hidden="true">
                      {showTitle && <span className="block truncate text-[12px] font-semibold tracking-[-0.01em]">{photo.title}</span>}
                      {takenAt && <span className={`${showTitle ? 'mt-1' : ''} block text-[9px] font-medium tracking-[0.08em] text-white/68`}>拍摄于 {takenAt}</span>}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        ) : (
          <motion.div
            className="spatial-album-empty apple-secondary-text relative z-10 flex min-h-48 items-center justify-center rounded-[22px] px-6 text-center sm:min-h-52 sm:rounded-[26px]"
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
