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

        <div className="flex items-center gap-1 md:gap-2">
          <a href="#memory-section" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-[180ms] hover:text-[var(--page-fg)] md:block">
            回忆
          </a>
          <a href="#about" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-[180ms] hover:text-[var(--page-fg)] md:block">
            关于
          </a>
          <button
            type="button"
            onClick={onOpenPhotoManager}
            className="apple-toolbar-button min-w-0 px-4"
            aria-label="管理共享图库中的照片"
          >
            <span className="text-[12px] font-semibold">管理照片</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
