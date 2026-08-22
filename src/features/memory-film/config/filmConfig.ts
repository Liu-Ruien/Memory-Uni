export const FILM_WALL_LIMIT = 20
export const FILM_MOBILE_WALL_LIMIT = 10
export const FILM_SCENE_BATCH_LIMIT = 20
export const FILM_MOBILE_RING_LIMIT = 8
export const FILM_MOBILE_TUNNEL_LIMIT = 8
export const MIN_READY_PHOTOS = 6
export const FILM_PRELOAD_CONCURRENCY = 4

export type FilmStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'finished'

export const filmChapters = [
  { scene: 'photo-wall', label: '共同校样', shortLabel: '校样' },
  { scene: 'controlled-scatter', label: '散落片段', shortLabel: '散落' },
  { scene: 'horizontal-stream', label: '时间向前', shortLabel: '流动' },
  { scene: 'memory-ring', label: '重新相遇', shortLabel: '相遇' },
  { scene: 'memory-tunnel', label: '穿过四年', shortLabel: '穿行' },
  { scene: 'final-gathering', label: '重回一处', shortLabel: '重聚' },
  { scene: 'film-text', label: '写给我们', shortLabel: '书信' },
] as const

export const filmDurations = {
  introTransition: 1.2,
  photoWall: 4.8,
  wallToScatter: 1.7,
  scatterHold: 2.3,
  scatterToStream: 1.9,
  horizontalStream: 8.2,
  ringTransition: 2,
  ringOrbit: 7,
  tunnelTransition: 1.4,
  tunnelTravel: 7.6,
  gatheringTransition: 3,
  gatheringHold: 3,
  photoDissolve: 1.2,
  eraTitle: 2.5,
  endingText: 14,
  credits: 8.5,
  finalBlack: 0.8,
  finalMessage: 3,
  endingUi: 1.2,
} as const

export const filmAudioConfig = {
  src: '/audio/background.wav',
  volume: 0.28,
} as const

export const filmRuntimeSeconds = Object.values(filmDurations).reduce((total, duration) => total + duration, 0)

export const filmRuntimeLabel = `${String(Math.floor(filmRuntimeSeconds / 60)).padStart(2, '0')}:${String(Math.round(filmRuntimeSeconds % 60)).padStart(2, '0')}`

export const filmCopy = {
  university: 'Linyi University',
  period: '2022.09 — 2026.06',
  endingPeriod: '2022 — 2026',
} as const
