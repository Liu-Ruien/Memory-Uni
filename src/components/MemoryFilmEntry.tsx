import { useState, type MouseEvent } from 'react'
import { isMemoryFilmBlockedDevice } from '../utils/memoryFilmAvailability'
import { MobileFilmNoticeDialog } from './MobileFilmNoticeDialog'

export function MemoryFilmEntry() {
  const [noticeOpen, setNoticeOpen] = useState(false)

  const handleOpenFilm = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isMemoryFilmBlockedDevice()) return
    event.preventDefault()
    setNoticeOpen(true)
  }

  return (
    <div className="memory-film-entry">
      <a
        href="/memory-film"
        className="memory-film-portal"
        aria-label="开始沉浸式回忆"
        onClick={handleOpenFilm}
      >
        <span className="memory-film-portal-copy">
          <small>MEMORY FILM</small>
          <strong>开始沉浸式回忆</strong>
        </span>
        <span className="memory-film-portal-aperture" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 7.4v9.2c0 .8.9 1.3 1.6.9l7.1-4.6a1.05 1.05 0 0 0 0-1.8l-7.1-4.6c-.7-.4-1.6.1-1.6.9Z" />
          </svg>
        </span>
      </a>
      <p className="memory-film-entry-note">
        将四年的照片重新播放一次。
      </p>
      <MobileFilmNoticeDialog open={noticeOpen} onClose={() => setNoticeOpen(false)} />
    </div>
  )
}
