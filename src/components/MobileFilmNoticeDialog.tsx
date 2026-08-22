import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { appleEaseOut } from '../design/motion'
import { useDialogFocusScope } from '../hooks/useDialogFocusScope'

interface MobileFilmNoticeDialogProps {
  open: boolean
  onClose: () => void
}

export function MobileFilmNoticeDialog({ open, onClose }: MobileFilmNoticeDialogProps) {
  const dismissButtonRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const dialogRef = useDialogFocusScope<HTMLElement>(open, {
    initialFocusRef: dismissButtonRef,
    onEscape: onClose,
  })

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="mobile-film-notice-layer"
          data-dialog-layer="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: appleEaseOut }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
        >
          <motion.section
            ref={dialogRef}
            className="mobile-film-notice"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(18px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(14px) scale(0.98)' }}
            transition={{ duration: 0.25, ease: appleEaseOut }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-film-notice-title"
            aria-describedby="mobile-film-notice-description"
            tabIndex={-1}
            data-motion-transform="true"
          >
            <button
              ref={dismissButtonRef}
              type="button"
              className="mobile-film-notice-dismiss"
              aria-label="关闭提示"
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
              </svg>
            </button>

            <div className="mobile-film-notice-visual" aria-hidden="true">
              <div className="mobile-film-notice-screen">
                <img src="/images/photo-together.jpg" alt="" />
                <span><i /><i /><i /></span>
              </div>
              <div className="mobile-film-notice-stand" />
            </div>

            <div className="mobile-film-notice-copy">
              <h2 id="mobile-film-notice-title">这段回忆，<br />留给大一点的屏幕。</h2>
              <p id="mobile-film-notice-description">
                Memory Film 会让照片在空间里重新排列，并配合音乐全屏播放。为了保留完整的画面和节奏，请使用电脑浏览器观看。
              </p>
              <p className="mobile-film-notice-device"><span aria-hidden="true" />电脑端可用 · 建议佩戴耳机</p>
            </div>

            <button type="button" className="mobile-film-notice-close" onClick={onClose}>
              继续浏览相册
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
