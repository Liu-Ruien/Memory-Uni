export const filmMotion = {
  ease: {
    enter: 'expo.out',
    leave: 'power3.in',
    handoff: 'expo.inOut',
    settle: 'back.out(1.08)',
    drift: 'sine.inOut',
    ui: 'power3.out',
  },
  chapterOverlap: {
    streamToRing: 0.36,
    ringToTunnel: 0.32,
    tunnelToGathering: 0.34,
  },
  label: {
    enter: 0.52,
    leave: 0.4,
  },
  crossfade: {
    out: 0.18,
    in: 0.24,
  },
} as const

export function organicStagger(index: number, count: number, step = 0.012) {
  const centerDistance = Math.abs(index - (count - 1) / 2)
  return centerDistance * step + (index % 3) * step * 0.34
}

