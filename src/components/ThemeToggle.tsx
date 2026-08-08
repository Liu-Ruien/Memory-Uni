interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextTheme = theme === 'light' ? '深色' : '浅色'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/45 text-[15px] text-neutral-800 transition-colors duration-300 hover:bg-white/80 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-100 dark:hover:bg-white/[0.09]"
      aria-label={`切换为${nextTheme}模式`}
      title={`切换为${nextTheme}模式`}
    >
      <span aria-hidden="true" className="leading-none">
        {theme === 'light' ? '☼' : '☾'}
      </span>
    </button>
  )
}
