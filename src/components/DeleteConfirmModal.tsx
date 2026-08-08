import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { Photo } from '../data/photos'

interface DeleteConfirmModalProps {
  isOpen: boolean
  photo: Photo | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmModal({
  isOpen,
  photo,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    cancelButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 px-5 py-8 backdrop-blur-[3px] dark:bg-black/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) onCancel()
          }}
          role="presentation"
        >
          <motion.section
            className="w-full max-w-[390px] rounded-[26px] border border-white/45 bg-[#f8f8f6]/95 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#171717]/95 dark:shadow-[0_32px_100px_rgba(0,0,0,0.62)] sm:p-7"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
          >
            <div className="flex items-start gap-4">
              <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-[12px] bg-neutral-200 ring-1 ring-black/[0.06] dark:bg-neutral-800 dark:ring-white/[0.08]">
                <img src={photo.src} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              </div>
              <div className="min-w-0 pt-1">
                <h2 id="delete-confirm-title" className="text-xl font-medium tracking-[-0.035em] text-neutral-900 dark:text-neutral-100">
                  删除这张回忆？
                </h2>
                <p id="delete-confirm-description" className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  删除后，所有人都无法再看到这张照片。
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="min-h-11 rounded-full border border-black/10 bg-white/55 px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-45 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={isDeleting}
                className="min-h-11 rounded-full bg-[#c64f47] px-5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.01] hover:bg-[#b94740] active:scale-[0.985] disabled:cursor-wait disabled:opacity-60"
              >
                {isDeleting ? '正在删除…' : '删除'}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
