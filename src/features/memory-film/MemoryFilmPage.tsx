import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Photo } from '../../data/photos'
import type { PhotoStorage } from '../../storage/PhotoStorage'
import { SupabasePhotoStorage } from '../../storage/SupabasePhotoStorage'
import {
  isMemoryFilmBlockedDevice,
  subscribeToMemoryFilmDeviceChanges,
} from '../../utils/memoryFilmAvailability'
import { FilmIntro } from './components/FilmIntro'
import { FilmMobileUnavailable } from './components/FilmMobileUnavailable'
import { FilmStage } from './components/FilmStage'
import { MemoryFilmBackground, type FilmAtmosphereScene } from './components/MemoryFilmBackground'
import {
  FILM_PRELOAD_CONCURRENCY,
  MIN_READY_PHOTOS,
  filmAudioConfig,
  type FilmStatus,
} from './config/filmConfig'
import { PhotoPreloadManager } from './utils/PhotoPreloadManager'
import { FilmPhotoScheduler } from './utils/FilmPhotoScheduler'
import { orderPhotosForPreload } from './utils/photoLayout'
import './memoryFilm.css'

const filmPhotoStorage: PhotoStorage = new SupabasePhotoStorage()
const filmPhotoPreloader = new PhotoPreloadManager(FILM_PRELOAD_CONCURRENCY)
let filmPhotosSessionPromise: Promise<Photo[]> | null = null
let hasLoggedRealFilmData = false

function getFilmPhotosOnce() {
  if (!filmPhotosSessionPromise) {
    filmPhotosSessionPromise = filmPhotoStorage.getPhotos().catch((error: unknown) => {
      // A failed request may be retried after the page is re-entered; successful metadata stays cached.
      filmPhotosSessionPromise = null
      throw error
    })
  }
  return filmPhotosSessionPromise
}

function fadeAudio(audio: HTMLAudioElement, targetVolume: number, duration = 700) {
  const startVolume = audio.volume
  const startedAt = performance.now()
  let cancelled = false
  const tick = (now: number) => {
    if (cancelled) return
    const progress = Math.min(1, (now - startedAt) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    audio.volume = startVolume + (targetVolume - startVolume) * eased
    if (progress < 1) {
      requestAnimationFrame(tick)
    } else if (targetVolume === 0) {
      audio.pause()
    }
  }
  requestAnimationFrame(tick)
  return () => { cancelled = true }
}

export default function MemoryFilmPage() {
  const reduceMotion = useReducedMotion()
  const pageRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioFadeCancelRef = useRef<(() => void) | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [status, setStatus] = useState<FilmStatus>('idle')
  const [readyPhotoCount, setReadyPhotoCount] = useState(0)
  const [isFilmUnavailableDevice, setIsFilmUnavailableDevice] = useState(isMemoryFilmBlockedDevice)
  const [playbackKey, setPlaybackKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [atmosphereScene, setAtmosphereScene] = useState<FilmAtmosphereScene>('intro')

  useEffect(() => {
    if (isFilmUnavailableDevice) {
      setPhotos([])
      setReadyPhotoCount(0)
      setError(null)
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')

    void getFilmPhotosOnce()
      .then((storedPhotos) => {
        if (cancelled) return
        setPhotos(storedPhotos)
        setError(null)
        if (storedPhotos.length === 0) setStatus('idle')
      })
      .catch(() => {
        if (cancelled) return
        setError('load-failed')
        setStatus('idle')
      })

    return () => { cancelled = true }
  }, [isFilmUnavailableDevice])

  useEffect(() => {
    return subscribeToMemoryFilmDeviceChanges(setIsFilmUnavailableDevice)
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousThemeColor = themeColor?.content

    document.title = 'Memory Film — Memory Uni'
    if (themeColor) themeColor.content = '#061817'

    return () => {
      document.title = previousTitle
      if (themeColor && previousThemeColor) themeColor.content = previousThemeColor
    }
  }, [])

  useEffect(() => () => {
    audioFadeCancelRef.current?.()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (!page || status !== 'playing') {
      page?.classList.remove('memory-film-cursor-idle')
      return
    }
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!finePointer || navigator.maxTouchPoints > 0) return

    let idleTimer = window.setTimeout(() => page.classList.add('memory-film-cursor-idle'), 1750)
    const showCursor = () => {
      page.classList.remove('memory-film-cursor-idle')
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => page.classList.add('memory-film-cursor-idle'), 1750)
    }
    page.addEventListener('pointermove', showCursor, { passive: true })
    return () => {
      window.clearTimeout(idleTimer)
      page.removeEventListener('pointermove', showCursor)
      page.classList.remove('memory-film-cursor-idle')
    }
  }, [status])

  const scheduler = useMemo(() => new FilmPhotoScheduler(photos, isFilmUnavailableDevice), [isFilmUnavailableDevice, photos])
  const filmPhotos = useMemo(() => scheduler.getAllPhotos(), [scheduler])
  const wallPhotos = useMemo(() => scheduler.getWallPhotos(), [scheduler])
  const minimumReadyPhotos = Math.min(MIN_READY_PHOTOS, wallPhotos.length)

  useEffect(() => {
    if (!import.meta.env.DEV || filmPhotos.length === 0 || hasLoggedRealFilmData) return

    hasLoggedRealFilmData = true
    const snapshot = scheduler.getDebugSnapshot()
    console.debug([
      '[Memory Film Real Data]',
      `Total photos: ${snapshot.photoCount}`,
      `Wall: ${snapshot.sceneBatches.wall}`,
      `Scatter: ${snapshot.sceneBatches.scatter}`,
      `Stream: ${snapshot.sceneBatches.stream}`,
      `Ring: ${snapshot.sceneBatches.ring}`,
      `Tunnel: ${snapshot.sceneBatches.tunnel}`,
      `Final: ${snapshot.sceneBatches.final}`,
      `Unique shown before Final: ${snapshot.uniqueShownBeforeFinal}`,
      `Unseen before Final: ${snapshot.unseenBeforeFinal}`,
      `Unseen after Final: ${snapshot.unseenAfterFinal}`,
      `Preload concurrency: ${FILM_PRELOAD_CONCURRENCY}`,
    ].join('\n'))
  }, [filmPhotos.length, scheduler])

  useEffect(() => {
    if (isFilmUnavailableDevice || wallPhotos.length === 0) return

    let cancelled = false
    const prioritizedPhotos = orderPhotosForPreload(wallPhotos, isFilmUnavailableDevice)
    setReadyPhotoCount(0)
    setStatus((current) => current === 'playing' || current === 'finished' ? current : 'loading')

    void filmPhotoPreloader.preload(prioritizedPhotos, (progress) => {
      if (cancelled) return
      setReadyPhotoCount(progress.successful)
      if (progress.successful >= minimumReadyPhotos) {
        setStatus((current) => current === 'playing' || current === 'finished' ? current : 'ready')
      }
    }).then((progress) => {
      if (cancelled) return
      if (progress.successful < minimumReadyPhotos) {
        setError('prepare-failed')
        setStatus((current) => current === 'playing' || current === 'finished' ? current : 'idle')
      }
    })

    return () => { cancelled = true }
  }, [isFilmUnavailableDevice, minimumReadyPhotos, wallPhotos])

  const preloadScenePhotos = useCallback((scenePhotos: Photo[]) => {
    void filmPhotoPreloader.preload(scenePhotos)
  }, [])

  const startAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audioFadeCancelRef.current?.()
    audioFadeCancelRef.current = null
    audio.currentTime = 0
    audio.volume = filmAudioConfig.volume
    void audio.play().catch(() => undefined)
  }, [])

  const startFilm = useCallback(() => {
    if (status !== 'ready' || filmPhotos.length === 0) return

    // Fullscreen and audio both start inside the trusted click event; either may fail silently.
    void pageRef.current?.requestFullscreen?.().catch(() => undefined)
    startAudio()
    setPlaybackKey((current) => current + 1)
    setStatus('playing')
    setAtmosphereScene('photo-wall')
  }, [filmPhotos.length, startAudio, status])

  const replay = useCallback(() => {
    startAudio()
    setPlaybackKey((current) => current + 1)
    setStatus('playing')
    setAtmosphereScene('photo-wall')
  }, [startAudio])

  const finishFilm = useCallback(() => {
    setStatus('finished')
    const audio = audioRef.current
    if (audio && !audio.paused) {
      audioFadeCancelRef.current?.()
      audioFadeCancelRef.current = fadeAudio(audio, 0, 900)
    }
  }, [])

  const leaveFilm = useCallback(() => {
    audioFadeCancelRef.current?.()
    audioFadeCancelRef.current = null
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!isFilmUnavailableDevice) return
    leaveFilm()
    setStatus('idle')
    setAtmosphereScene('intro')
  }, [isFilmUnavailableDevice, leaveFilm])

  const showIntro = status === 'idle' || status === 'loading' || status === 'ready'

  if (isFilmUnavailableDevice) {
    return (
      <div ref={pageRef} className="memory-film-page memory-film-page--mobile-unavailable">
        <MemoryFilmBackground scene="intro" />
        <FilmMobileUnavailable onBack={leaveFilm} />
      </div>
    )
  }

  return (
    <div
      ref={pageRef}
      className="memory-film-page"
      data-film-status={status}
      data-ready-count={readyPhotoCount}
      data-photo-count={filmPhotos.length}
    >
      <MemoryFilmBackground scene={atmosphereScene} />
      <audio ref={audioRef} src={filmAudioConfig.src} preload="none" loop />

      <AnimatePresence initial={false} mode="sync">
        {showIntro ? (
          <motion.div
            key="film-intro"
            className="memory-film-view"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.56, ease: [0.16, 1, 0.3, 1] }}
          >
            <FilmIntro
              previewPhotos={wallPhotos}
              photoCount={filmPhotos.length}
              readyPhotoCount={readyPhotoCount}
              minimumReadyPhotos={minimumReadyPhotos}
              status={status}
              error={error}
              onStart={startFilm}
              onBack={leaveFilm}
            />
          </motion.div>
        ) : (
          <motion.div
            key="film-stage"
            className="memory-film-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.24 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <FilmStage
              photos={filmPhotos}
              playbackKey={playbackKey}
              isMobile={isFilmUnavailableDevice}
              onPreloadPhotos={preloadScenePhotos}
              onComplete={finishFilm}
              onReplay={replay}
              onBack={leaveFilm}
              onSceneChange={setAtmosphereScene}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
