import type { MouseEventHandler, ReactNode } from 'react'

interface GlassButtonProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
  ariaLabel?: string
  title?: string
}

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ')
}

/**
 * A single, restrained glass control for links and buttons.
 * The outer wrapper owns feedback; the interactive element remains stable.
 */
export function GlassButton({
  children,
  className,
  contentClassName,
  href,
  type = 'button',
  disabled = false,
  onClick,
  ariaLabel,
  title,
}: GlassButtonProps) {
  const content = (
    <span className={classes('glass-button-content glass-button-text', contentClassName)}>
      {children}
    </span>
  )

  return (
    <span className={classes('glass-button-wrap', className)}>
      {href ? (
        <a
          href={href}
          className="glass-button"
          onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
          aria-label={ariaLabel}
          title={title}
        >
          {content}
        </a>
      ) : (
        <button
          type={type}
          className="glass-button"
          disabled={disabled}
          onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
          aria-label={ariaLabel}
          title={title}
        >
          {content}
        </button>
      )}
      <span className="glass-button-shadow" aria-hidden="true" />
    </span>
  )
}
