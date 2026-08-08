import { AnimatePresence, motion } from 'framer-motion'
import type { Photo } from '../data/photos'

interface PhotoGridProps {
  photos: Photo[]
  isLoading?: boolean
  onSelect: (index: number) => void
}

function hasMeaningfulTitle(photo: Photo) {
  return Boolean(photo.title.trim() && photo.title !== '未命名回忆')
}

export function PhotoGrid({ photos, isLoading = false, onSelect }: PhotoGridProps) {
  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-28 pt-12 sm:px-8 sm:pb-36 sm:pt-20 lg:px-12" aria-labelledby="all-moments-heading">
      <div className="mb-12 flex items-end justify-between border-b border-black/[0.07] pb-7 dark:border-white/[0.08] sm:mb-16 sm:pb-8">
        <div>
          <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-neutral-400 dark:text-neutral-500">记忆碎片</p>
          <h2 id="all-moments-heading" className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">所有回忆</h2>
          <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">散落在时间里的那些瞬间。</p>
        </div>
        <motion.span
          key={isLoading ? 'loading-count' : photos.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500"
          aria-label={isLoading ? '共同回忆正在加载' : `共 ${photos.length} 张照片`}
        >
          {isLoading ? '··' : String(photos.length).padStart(2, '0')}
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {isLoading && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 rounded-[16px] border border-black/[0.05] bg-white/35 px-4 py-3 text-[11px] text-neutral-400 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-neutral-500">
              <span className="size-2 animate-pulse rounded-full bg-current" aria-hidden="true" />
              共同回忆正在慢慢浮现…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => {
          const showSharedInfo = photo.source === 'supabase' && (hasMeaningfulTitle(photo) || photo.uploadedAt)
          return (
          <motion.button
            key={photo.id}
            type="button"
            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-neutral-200 text-left dark:bg-neutral-800 sm:rounded-[20px]"
            onClick={() => onSelect(index)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.04, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`查看照片：${photo.title}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
            {showSharedInfo ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent px-3 pb-3 pt-10 text-left text-white sm:px-4 sm:pb-4" aria-hidden="true">
                {hasMeaningfulTitle(photo) && <span className="block truncate text-[11px] font-medium">{photo.title}</span>}
                {photo.uploadedAt && <span className="mt-1 block text-[9px] tracking-[0.06em] text-white/65">上传于 {photo.uploadedAt}</span>}
              </span>
            ) : (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left text-[11px] font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-4" aria-hidden="true">
                {photo.title}
              </span>
            )}
          </motion.button>
          )
        })}
      </div>
    </section>
  )
}
