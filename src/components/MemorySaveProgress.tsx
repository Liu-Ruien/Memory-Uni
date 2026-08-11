import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { appleEaseOut, appleSpring } from '../design/motion'

export type MemorySaveStage = 'reading' | 'checking' | 'processing' | 'uploading' | 'success'

interface MemorySaveProgressProps {
  stage: MemorySaveStage
  count: number
}

const stages: Array<{ id: MemorySaveStage; label: string; detail: (count: number) => string }> = [
  { id: 'reading', label: '读取照片', detail: (count) => `正在读取 ${count} 张照片。` },
  { id: 'checking', label: '检查照片', detail: (count) => `正在确认 ${count} 张照片的格式与大小。` },
  { id: 'processing', label: '处理照片', detail: (count) => `正在整理拍摄信息与裁剪，共 ${count} 张。` },
  { id: 'uploading', label: '上传云端', detail: (count) => `正在将 ${count} 张照片安全写入共同相册。` },
  { id: 'success', label: '保存完成', detail: (count) => `${count} 张照片已经出现在共同相册中。` },
]

export function MemorySaveProgress({ stage, count }: MemorySaveProgressProps) {
  const reduceMotion = useReducedMotion()
  const activeIndex = stages.findIndex((item) => item.id === stage)
  const activeStage = stages[Math.max(0, activeIndex)]
  const complete = stage === 'success'
  const progress = (activeIndex + 1) / stages.length

  return (
    <motion.section
      className={`memory-save-progress liquid-glass-surface mt-4 overflow-hidden rounded-[24px] px-5 py-5 sm:px-6 sm:py-6 ${complete ? 'is-complete' : ''}`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(6px) scale(0.985)' }}
      animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-4px) scale(0.99)' }}
      transition={complete ? appleSpring : { duration: 0.25, ease: appleEaseOut }}
      role="status"
      aria-live="polite"
      aria-label={`${activeStage.label}。${activeStage.detail(count)}`}
      data-motion-transform="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="apple-kicker">iCloud 共同相册</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.035em] sm:text-xl">
            {complete ? '这份回忆已经保存' : '正在保存你的回忆'}
          </h3>
        </div>
        <span className={`memory-save-orb ${complete ? 'is-complete' : ''}`} aria-hidden="true">
          {complete ? (
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { opacity: 0, transform: 'scale(0.86)' }}
              animate={{ opacity: 1, transform: 'scale(1)' }}
              transition={appleSpring}
              data-motion-transform="true"
            >
              <path d="m6.5 12.5 3.3 3.2 7.7-8" />
            </motion.svg>
          ) : (
            <span className="memory-save-orb-core" />
          )}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={stage}
            className="min-w-0 flex-1"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(4px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-3px)' }}
            transition={{ duration: 0.2, ease: appleEaseOut }}
            data-motion-transform="true"
          >
            <span className="block text-xs font-semibold text-[var(--page-fg)]">{activeStage.label}</span>
            <span className="mt-1 block truncate text-[10px] text-[var(--text-tertiary)]">{activeStage.detail(count)}</span>
          </motion.p>
        </AnimatePresence>
        <span className="text-[10px] font-medium tabular-nums text-[var(--text-tertiary)]">
          {activeIndex + 1} / {stages.length}
        </span>
      </div>

      <div
        className="memory-flux-track mt-4"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={stages.length}
        aria-valuenow={activeIndex + 1}
        aria-valuetext={activeStage.label}
      >
        <motion.span
          className={`memory-flux-fill ${complete ? 'is-complete' : ''}`}
          initial={false}
          animate={{ transform: `scaleX(${progress})` }}
          transition={reduceMotion ? { duration: 0.12 } : appleSpring}
          data-motion-transform="true"
        >
          {!complete && !reduceMotion && <span className="memory-flux-sheen" aria-hidden="true" />}
        </motion.span>
      </div>

      <ol className="mt-4 grid grid-cols-5 gap-1.5" aria-label="保存进度">
        {stages.map((item, index) => {
          const current = index === activeIndex
          const done = index < activeIndex || complete
          return (
            <li key={item.id} className="min-w-0 text-center">
              <span className={`memory-save-step-dot ${current ? 'is-current' : ''} ${done ? 'is-done' : ''}`} aria-hidden="true">
                {done ? '✓' : index + 1}
              </span>
              <span className={`mt-1.5 block truncate text-[7px] font-medium sm:text-[9px] ${current ? 'text-[var(--page-fg)]' : 'text-[var(--text-tertiary)]'}`}>
                {item.label}
              </span>
            </li>
          )
        })}
      </ol>
    </motion.section>
  )
}
