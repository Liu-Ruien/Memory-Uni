import { motion, useReducedMotion } from 'framer-motion'
import { appleEaseOut } from '../design/motion'

interface EmptyMemoryStateProps {
  isLoading: boolean
  onUpload: () => void
}

export function EmptyMemoryState({ isLoading, onUpload }: EmptyMemoryStateProps) {
  const reduceMotion = useReducedMotion()
  if (isLoading) {
    return (
      <div className="mx-auto mt-14 flex w-full max-w-xl items-center justify-center px-6 py-20" role="status" aria-label="共同回忆正在加载">
        <div className="text-center">
          <motion.span
            className="mx-auto block size-8 rounded-full border border-[var(--separator)] border-t-[var(--text-secondary)]"
            animate={reduceMotion ? { opacity: [0.45, 1, 0.45] } : { transform: 'rotate(360deg)' }}
            transition={{ duration: reduceMotion ? 1.4 : 1.1, ease: 'linear', repeat: Infinity }}
            aria-hidden="true"
          />
          <p className="apple-tertiary-text mt-5 text-xs tracking-[0.06em]">共同回忆正在慢慢浮现…</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="mx-auto mt-14 w-[min(88vw,560px)] rounded-[var(--radius-sheet)] bg-[var(--surface-muted)] px-6 py-14 text-center sm:py-16"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(10px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.3, ease: appleEaseOut }}
      data-motion-transform="true"
    >
      <p className="apple-secondary-text text-base leading-7">这里还没有共同回忆，<br />上传第一张照片吧。</p>
      <button
        type="button"
        onClick={onUpload}
        className="apple-primary-button mt-7"
      >
        上传第一张照片
      </button>
    </motion.div>
  )
}
