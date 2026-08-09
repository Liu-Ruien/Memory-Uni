import { motion } from 'framer-motion'
import type { AcademicYear } from '../data/academicYears'
import type { Photo } from '../data/photos'
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
  return (
    <section
      id={`year-${year.id}`}
      className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
      aria-labelledby={`year-${year.id}-heading`}
    >
      <motion.div
        className="mb-12 flex items-end justify-between border-b border-black/[0.07] pb-7 dark:border-white/[0.08] sm:mb-16 sm:pb-9"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.65 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
            {year.period}
          </p>
          <h2
            id={`year-${year.id}-heading`}
            className="mt-3 text-3xl font-medium tracking-[-0.045em] text-neutral-950 dark:text-neutral-100 sm:text-5xl"
          >
            {year.title}
          </h2>
          <p className="mt-4 max-w-md text-xs leading-6 text-neutral-400 dark:text-neutral-500 sm:text-sm">
            {year.description}
          </p>
        </div>
        <span className="pb-1 text-xs tabular-nums text-neutral-400 dark:text-neutral-500" aria-label={`共 ${photos.length} 张照片`}>
          {String(photos.length).padStart(2, '0')}
        </span>
      </motion.div>

      {photos.length > 0 ? (
        <div className="columns-2 gap-3 sm:gap-5 md:columns-3 lg:columns-4">
          {photos.map((photo, index) => {
            const takenAt = formatTakenAt(photo.takenAt)
            const showTitle = hasMeaningfulTitle(photo)

            return (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => onSelect(photo.id)}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[16px] bg-neutral-200 text-left shadow-[0_8px_24px_rgba(24,24,21,0.05)] dark:bg-neutral-900 sm:mb-5 sm:rounded-[22px]"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.045, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`查看照片：${showTitle ? photo.title : takenAt ? `拍摄于 ${takenAt}` : '拍摄时间未知'}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full select-none transition-transform duration-700 ease-out group-hover:scale-[1.018]"
                  draggable={false}
                />
                {(showTitle || takenAt) && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent px-3 pb-3 pt-12 text-white opacity-100 transition-opacity duration-300 sm:px-4 sm:pb-4 sm:opacity-0 sm:group-hover:opacity-100" aria-hidden="true">
                    {showTitle && <span className="block truncate text-[11px] font-medium">{photo.title}</span>}
                    {takenAt && <span className={`${showTitle ? 'mt-1' : ''} block text-[9px] tracking-[0.08em] text-white/70`}>拍摄于 {takenAt}</span>}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      ) : (
        <motion.div
          className="flex min-h-56 items-center justify-center rounded-[28px] border border-dashed border-black/[0.09] bg-black/[0.015] px-6 text-center dark:border-white/[0.09] dark:bg-white/[0.015]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <p className="text-sm leading-7 text-neutral-400 dark:text-neutral-500">
            这一年的故事还在等待照片。
          </p>
        </motion.div>
      )}
    </section>
  )
}
