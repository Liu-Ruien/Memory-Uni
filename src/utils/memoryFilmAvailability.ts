interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    mobile?: boolean
  }
}

const handheldUserAgent = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile|Tablet/i
const coarsePointerQuery = '(any-pointer: coarse)'

/**
 * Memory Film is intentionally a desktop-only experience. The decision uses
 * stable device signals instead of the current viewport width, so rotating a
 * phone cannot unlock the desktop film or trigger its photo/audio loading.
 */
export function isMemoryFilmBlockedDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const deviceNavigator = navigator as NavigatorWithUserAgentData
  if (deviceNavigator.userAgentData?.mobile) return true
  if (handheldUserAgent.test(deviceNavigator.userAgent)) return true

  const hasTouch = deviceNavigator.maxTouchPoints > 0
  const hasCoarsePointer = window.matchMedia(coarsePointerQuery).matches
  const compactHardwareScreen = Math.min(window.screen.width, window.screen.height) <= 1024

  return hasTouch && hasCoarsePointer && compactHardwareScreen
}

export function subscribeToMemoryFilmDeviceChanges(onChange: (blocked: boolean) => void) {
  const coarsePointer = window.matchMedia(coarsePointerQuery)
  const update = () => onChange(isMemoryFilmBlockedDevice())

  coarsePointer.addEventListener('change', update)
  window.addEventListener('resize', update, { passive: true })
  window.addEventListener('orientationchange', update, { passive: true })

  return () => {
    coarsePointer.removeEventListener('change', update)
    window.removeEventListener('resize', update)
    window.removeEventListener('orientationchange', update)
  }
}
