import { useEffect, useState } from 'react'
import { MusicControl } from './MusicControl'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenPhotoManager: () => void
}

export function Header({ theme, onToggleTheme, onOpenPhotoManager }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 56)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-[250ms] ease-[var(--ease-out)] ${
        scrolled
          ? 'liquid-glass-header'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12" aria-label="主导航">
        <a href="#top" className="rounded-lg px-1 py-2 text-[12px] font-semibold tracking-[0.08em] text-[var(--page-fg)] transition-opacity duration-[180ms] hover:opacity-65">
          我的回忆
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a href="#memory-section" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-[180ms] hover:text-[var(--page-fg)] md:block">
            回忆
          </a>
          <a href="#about" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-[180ms] hover:text-[var(--page-fg)] md:block">
            关于
          </a>
          <button
            type="button"
            onClick={onOpenPhotoManager}
            className="apple-toolbar-button px-0 sm:min-w-0 sm:px-4"
            aria-label="管理共享图库中的照片"
          >
            <svg className="size-[17px] sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="hidden text-[12px] font-semibold sm:inline">管理照片</span>
          </button>
          <MusicControl />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </nav>
    </header>
  )
}
