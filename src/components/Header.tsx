import { useEffect, useState } from 'react'

interface HeaderProps {
  onOpenPhotoManager: () => void
}

export function Header({ onOpenPhotoManager }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 56)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`proof-header${scrolled ? ' is-scrolled' : ''}`}
    >
      <nav className="proof-header-nav" aria-label="主导航">
        <a href="#top" className="proof-brand" aria-label="返回 Memory Uni 首页">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <path d="M5 23V5h5.5l3.5 8 3.5-8H23v18h-4V10.8l-3.2 7.1h-3.6L9 10.8V23Z" />
          </svg>
          <span>
            <strong>MEMORY UNI</strong>
            <small>2022—2026 · LINYI UNIVERSITY</small>
          </span>
        </a>

        <div className="proof-header-actions">
          <a href="#memory-section" className="proof-header-link">
            四年相册
          </a>
          <a href="/memory-film" className="proof-header-link">
            Memory Film
          </a>
          <button
            type="button"
            onClick={onOpenPhotoManager}
            className="proof-header-upload"
            aria-label="补上一张照片或管理共享照片"
          >
            <span>补照片</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
