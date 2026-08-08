import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface TakenDateModalProps {
  isOpen: boolean
  filename: string
  value: string
  error: string | null
  onChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export function TakenDateModal({
  isOpen,
  filename,
  value,
  error,
  onChange,
  onCancel,
  onConfirm,
}: TakenDateModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 120)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusId)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-end bg-black/45 p-0 backdrop-blur-[3px] sm:place-items-center sm:p-6 dark:bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCancel()
          }}
          role="presentation"
        >
          <motion.form
            className="w-full max-w-md rounded-t-[26px] border border-black/[0.08] bg-[#f8f8f6] px-6 pb-6 pt-7 shadow-[0_28px_90px_rgba(0,0,0,0.24)] dark:border-white/[0.1] dark:bg-[#171717] sm:rounded-[26px] sm:px-8 sm:pb-8 sm:pt-8"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="taken-date-title"
          >
            <p className="text-[9px] font-semibold tracking-[0.22em] text-neutral-400 dark:text-neutral-500">照片信息</p>
            <h2 id="taken-date-title" className="mt-3 text-xl font-medium tracking-[-0.035em] sm:text-2xl">请输入照片拍摄时间</h2>
            <p className="mt-3 truncate text-xs text-neutral-400 dark:text-neutral-500" title={filename}>这张照片没有可读取的 EXIF 拍摄时间。</p>

            <label className="mt-7 block">
              <span className="mb-2 block text-[10px] tracking-[0.12em] text-neutral-500 dark:text-neutral-400">YYYY-MM-DD</span>
              <input
                ref={inputRef}
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-12 w-full rounded-[14px] border border-black/10 bg-white px-4 text-sm tabular-nums outline-none transition-shadow focus:border-black/25 focus:ring-4 focus:ring-black/[0.04] dark:border-white/[0.12] dark:bg-white/[0.05] dark:focus:border-white/25 dark:focus:ring-white/[0.04]"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'taken-date-error' : undefined}
              />
            </label>

            {error && <p id="taken-date-error" className="mt-2 text-xs text-amber-700 dark:text-amber-300">{error}</p>}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="min-h-12 rounded-full border border-black/10 bg-white/60 px-5 text-sm font-medium transition-colors hover:bg-white dark:border-white/[0.12] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
              >
                取消
              </button>
              <button
                type="submit"
                className="min-h-12 rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-transform hover:scale-[1.012] active:scale-[0.985] dark:bg-neutral-100 dark:text-neutral-900"
              >
                确认
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
