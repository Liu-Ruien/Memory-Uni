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
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#f5f2ec]/78 shadow-[0_1px_18px_rgba(70,57,38,0.035)] backdrop-blur-xl dark:bg-[#0d0d0d]/76 dark:shadow-[0_1px_20px_rgba(0,0,0,0.16)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="主导航">
        <a href="#top" className="text-[11px] font-semibold tracking-[0.22em] text-neutral-900 dark:text-neutral-100">
          我的回忆
        </a>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          <a href="#memory-section" className="hidden rounded-full px-3 py-2 text-xs text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white md:block sm:px-4 sm:text-sm">
            回忆
          </a>
          <a href="#about" className="hidden rounded-full px-3 py-2 text-xs text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white md:block sm:px-4 sm:text-sm">
            关于
          </a>
          <button
            type="button"
            onClick={onOpenPhotoManager}
            className="grid h-10 min-w-10 place-items-center rounded-full border border-black/10 bg-white/45 px-0 text-neutral-800 transition-colors duration-300 hover:bg-white/80 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-100 dark:hover:bg-white/[0.09] sm:px-4"
            aria-label="管理共享图库中的照片"
          >
            <span className="text-lg leading-none sm:hidden" aria-hidden="true">＋</span>
            <span className="hidden text-xs font-medium sm:inline">管理照片</span>
          </button>
          <MusicControl />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </nav>
    </header>
  )
}
