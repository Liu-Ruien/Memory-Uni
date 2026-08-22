import { useEffect, useRef, type RefObject } from 'react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const dialogStack: symbol[] = []

interface DialogFocusScopeOptions {
  initialFocusRef?: RefObject<HTMLElement | null>
  onEscape?: () => void
}

interface InertSnapshot {
  element: HTMLElement
  inert: boolean
  ariaHidden: string | null
}

function visibleFocusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => (
    element.getClientRects().length > 0
    && element.getAttribute('aria-hidden') !== 'true'
  ))
}

export function useDialogFocusScope<T extends HTMLElement>(
  active: boolean,
  options: DialogFocusScopeOptions = {},
) {
  const dialogRef = useRef<T>(null)
  const initialFocusRef = options.initialFocusRef
  const onEscapeRef = useRef(options.onEscape)
  onEscapeRef.current = options.onEscape

  useEffect(() => {
    if (!active || !dialogRef.current) return

    const dialog = dialogRef.current
    const layer = dialog.closest<HTMLElement>('[data-dialog-layer="true"]') ?? dialog
    const stackId = Symbol('dialog-focus-scope')
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const inertSnapshots: InertSnapshot[] = []

    for (const sibling of Array.from(layer.parentElement?.children ?? [])) {
      if (!(sibling instanceof HTMLElement) || sibling === layer) continue
      inertSnapshots.push({
        element: sibling,
        inert: sibling.inert,
        ariaHidden: sibling.getAttribute('aria-hidden'),
      })
      sibling.inert = true
      sibling.setAttribute('aria-hidden', 'true')
    }

    dialogStack.push(stackId)

    const focusInitialControl = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? visibleFocusableElements(dialog)[0] ?? dialog
      target.focus({ preventScroll: true })
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== stackId) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onEscapeRef.current?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = visibleFocusableElements(dialog)
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus({ preventScroll: true })
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement

      if (event.shiftKey && (current === first || !dialog.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !dialog.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.cancelAnimationFrame(focusInitialControl)
      document.removeEventListener('keydown', handleKeyDown, true)

      const stackIndex = dialogStack.lastIndexOf(stackId)
      if (stackIndex >= 0) dialogStack.splice(stackIndex, 1)

      for (const snapshot of inertSnapshots) {
        snapshot.element.inert = snapshot.inert
        if (snapshot.ariaHidden === null) snapshot.element.removeAttribute('aria-hidden')
        else snapshot.element.setAttribute('aria-hidden', snapshot.ariaHidden)
      }

      window.requestAnimationFrame(() => {
        if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
      })
    }
  }, [active, initialFocusRef])

  return dialogRef
}
