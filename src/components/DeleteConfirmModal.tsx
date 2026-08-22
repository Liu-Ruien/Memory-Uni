import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import type { Photo } from '../data/photos'
import { appleEaseOut } from '../design/motion'
import { useDialogFocusScope } from '../hooks/useDialogFocusScope'

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
  const reduceMotion = useReducedMotion()
  const dialogRef = useDialogFocusScope<HTMLElement>(isOpen && Boolean(photo), {
    initialFocusRef: cancelButtonRef,
    onEscape: () => {
      if (!isDeleting) onCancel()
    },
  })

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/34 px-5 py-8 backdrop-blur-lg dark:bg-black/66"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: appleEaseOut }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) onCancel()
          }}
          role="presentation"
          data-dialog-layer="true"
        >
          <motion.section
            ref={dialogRef}
            className="apple-modal-shell w-full max-w-[390px] p-6 sm:p-7"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.96)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.96)' }}
            transition={{ duration: 0.25, ease: appleEaseOut }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
            tabIndex={-1}
            data-motion-transform="true"
          >
            <div className="flex items-start gap-4">
              <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-[13px] bg-[var(--surface-muted)] shadow-[var(--shadow-small)]">
                <img src={photo.src} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              </div>
              <div className="min-w-0 pt-1">
                <h2 id="delete-confirm-title" className="text-xl font-semibold tracking-[-0.04em]">
                  删除这张回忆？
                </h2>
                <p id="delete-confirm-description" className="apple-secondary-text mt-2 text-sm leading-6">
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
                className="apple-secondary-button disabled:cursor-wait disabled:opacity-45"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={isDeleting}
                className="apple-danger-button disabled:cursor-wait disabled:opacity-60"
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
