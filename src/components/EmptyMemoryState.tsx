import { motion } from 'framer-motion'

interface EmptyMemoryStateProps {
  isLoading: boolean
  onUpload: () => void
}

export function EmptyMemoryState({ isLoading, onUpload }: EmptyMemoryStateProps) {
  if (isLoading) {
    return (
      <div className="mx-auto mt-14 flex w-full max-w-xl items-center justify-center px-6 py-20" role="status" aria-label="共同回忆正在加载">
        <div className="text-center">
          <motion.span
            className="mx-auto block size-8 rounded-full border border-black/10 border-t-black/45 dark:border-white/10 dark:border-t-white/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
            aria-hidden="true"
          />
          <p className="mt-5 text-xs tracking-[0.08em] text-neutral-400 dark:text-neutral-500">共同回忆正在慢慢浮现…</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="mx-auto mt-14 w-[min(88vw,560px)] rounded-[24px] border border-black/[0.07] bg-white/45 px-6 py-14 text-center dark:border-white/[0.08] dark:bg-white/[0.025] sm:py-16"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-base leading-7 text-neutral-600 dark:text-neutral-300">这里还没有共同回忆，<br />上传第一张照片吧。</p>
      <button
        type="button"
        onClick={onUpload}
        className="mt-7 min-h-12 rounded-full bg-neutral-900 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.015] active:scale-[0.985] dark:bg-neutral-100 dark:text-neutral-900"
      >
        上传第一张照片
      </button>
    </motion.div>
  )
}
