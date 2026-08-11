export const appleEaseOut = [0.23, 1, 0.32, 1] as const
export const appleEaseInOut = [0.77, 0, 0.175, 1] as const

export const appleSpring = {
  type: 'spring',
  duration: 0.4,
  bounce: 0,
} as const

export const appleGestureSpring = {
  type: 'spring',
  duration: 0.4,
  bounce: 0.16,
} as const

export const modalTransition = {
  duration: 0.25,
  ease: appleEaseOut,
} as const
