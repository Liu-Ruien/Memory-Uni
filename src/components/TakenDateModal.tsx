import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { academicYears, type AcademicYearId } from '../data/academicYears'
import { appleEaseOut } from '../design/motion'
import { useDialogFocusScope } from '../hooks/useDialogFocusScope'

interface TakenDateModalProps {
  isOpen: boolean
  filename: string
  value: string
  academicYear: AcademicYearId | ''
  error: string | null
  onChange: (value: string) => void
  onAcademicYearChange: (value: AcademicYearId) => void
  onCancel: () => void
  onConfirm: () => void
}

export function TakenDateModal({
  isOpen,
  filename,
  value,
  academicYear,
  error,
  onChange,
  onAcademicYearChange,
  onCancel,
  onConfirm,
}: TakenDateModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  const dialogRef = useDialogFocusScope<HTMLFormElement>(isOpen, {
    initialFocusRef: inputRef,
    onEscape: onCancel,
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-end bg-black/32 p-0 backdrop-blur-md sm:place-items-center sm:p-6 dark:bg-black/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: appleEaseOut }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCancel()
          }}
          role="presentation"
          data-dialog-layer="true"
        >
          <motion.form
            ref={dialogRef}
            className="apple-modal-shell w-full max-w-md !rounded-b-none !rounded-t-[30px] px-6 pb-6 pt-3 sm:!rounded-[30px] sm:px-8 sm:pb-8 sm:pt-8"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(18px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px) scale(0.98)' }}
            transition={{ duration: 0.25, ease: appleEaseOut }}
            onSubmit={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="taken-date-title"
            tabIndex={-1}
            data-motion-transform="true"
          >
            <span className="mx-auto mb-5 block h-1 w-9 rounded-full bg-[var(--separator-strong)] sm:hidden" aria-hidden="true" />
            <p className="apple-kicker">步骤 3 / 5 · 确认信息</p>
            <h2 id="taken-date-title" className="mt-3 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">补充这份回忆的信息</h2>
            <p className="apple-tertiary-text mt-2 truncate text-xs" title={filename}>{filename}</p>

            <label className="mt-7 block">
              <span className="apple-secondary-text mb-2 block text-[11px] font-medium">照片拍摄于</span>
              <input
                ref={inputRef}
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onInput={(event) => onChange(event.currentTarget.value)}
                className="min-h-12 w-full rounded-[14px] border-0 bg-[var(--surface-muted)] px-4 text-sm tabular-nums text-[var(--page-fg)] shadow-[inset_0_0_0_0.5px_var(--separator)] outline-none transition-shadow duration-[180ms] focus:shadow-[inset_0_0_0_1.5px_var(--accent),0_0_0_4px_rgba(0,113,227,0.12)]"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'taken-date-error' : undefined}
              />
            </label>

            <fieldset className="mt-6">
              <legend className="apple-secondary-text mb-2 text-[11px] font-medium">大学阶段</legend>
              <div className="grid grid-cols-2 gap-2">
                {academicYears.map((year) => {
                  const selected = academicYear === year.id
                  return (
                    <button
                      key={year.id}
                      type="button"
                      onClick={() => onAcademicYearChange(year.id)}
                      className={`min-h-12 rounded-[14px] border-0 px-3 text-left text-xs font-medium shadow-[inset_0_0_0_0.5px_var(--separator)] transition-[transform,background-color,color,box-shadow] duration-[180ms] ease-[var(--ease-out)] active:scale-[0.98] ${selected
                        ? 'bg-[var(--page-fg)] text-[var(--page-bg)] shadow-none'
                        : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'}`}
                      aria-pressed={selected}
                    >
                      {year.title}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {error && <p id="taken-date-error" className="mt-3 rounded-xl bg-amber-500/[0.09] px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">{error}</p>}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="apple-secondary-button"
              >
                取消
              </button>
              <button
                type="submit"
                className="apple-primary-button"
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
