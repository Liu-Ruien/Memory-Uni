import type { MouseEvent } from 'react'

export function MemoryFilmEntry() {
  const holdPlaceholderRoute = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
  }

  return (
    <div className="mt-6 flex flex-col items-center sm:mt-7">
      <a
        href="/memory-film"
        onClick={holdPlaceholderRoute}
        className="memory-film-entry-button"
        aria-label="开始沉浸式回忆，即将开放"
        aria-disabled="true"
        title="沉浸式回忆将在下一阶段开放"
      >
        <span>开始沉浸式回忆</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </a>
      <p className="mt-2.5 text-[11px] leading-5 tracking-[0.01em] text-[var(--text-tertiary)]">
        将四年的照片重新播放一次。
      </p>
    </div>
  )
}
