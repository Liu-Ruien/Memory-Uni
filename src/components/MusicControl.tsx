import { useCallback, useEffect, useRef, useState } from 'react'
import { musicConfig } from '../config/music'

const preferenceKey = 'archive-music-enabled'

export function MusicControl() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [playbackError, setPlaybackError] = useState(false)
  const [resumePreferred, setResumePreferred] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(preferenceKey) === 'true',
  )

  const cancelFade = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const fadeTo = useCallback(
    (targetVolume: number, onComplete?: () => void) => {
      const audio = audioRef.current
      if (!audio) return
      cancelFade()
      const initialVolume = audio.volume
      const startedAt = performance.now()

      const updateVolume = (time: number) => {
        const progress = Math.min(1, (time - startedAt) / musicConfig.fadeDuration)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        audio.volume = initialVolume + (targetVolume - initialVolume) * easedProgress
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(updateVolume)
        } else {
          animationFrameRef.current = null
          onComplete?.()
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateVolume)
    },
    [cancelFade],
  )

  const playWithFade = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    setIsTransitioning(true)
    setPlaybackError(false)
    cancelFade()
    audio.volume = 0

    try {
      await audio.play()
      setIsPlaying(true)
      fadeTo(musicConfig.volume, () => setIsTransitioning(false))
    } catch {
      setIsPlaying(false)
      setIsTransitioning(false)
      setPlaybackError(true)
    }
  }, [cancelFade, fadeTo])

  const pauseWithFade = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setIsTransitioning(true)
    fadeTo(0, () => {
      audio.pause()
      audio.volume = musicConfig.volume
      setIsPlaying(false)
      setIsTransitioning(false)
    })
  }, [fadeTo])

  useEffect(() => () => cancelFade(), [cancelFade])

  const togglePlayback = () => {
    if (isTransitioning) return
    if (isPlaying) {
      window.localStorage.setItem(preferenceKey, 'false')
      setResumePreferred(false)
      pauseWithFade()
    } else {
      window.localStorage.setItem(preferenceKey, 'true')
      setResumePreferred(true)
      void playWithFade()
    }
  }

  const label = playbackError
    ? '背景音乐暂时无法播放'
    : isPlaying
      ? '暂停背景音乐'
      : resumePreferred
        ? '继续播放背景音乐'
        : '播放背景音乐'

  return (
    <>
      <audio ref={audioRef} src={musicConfig.src} preload="metadata" loop aria-hidden="true" />
      <button
        type="button"
        data-music-control
        onClick={togglePlayback}
        className={`relative grid size-10 place-items-center rounded-full border text-[15px] transition-colors duration-300 ${
          playbackError
            ? 'border-red-300/50 bg-red-50/50 text-red-500 dark:border-red-400/20 dark:bg-red-400/[0.06] dark:text-red-300'
            : 'border-black/10 bg-white/45 text-neutral-800 hover:bg-white/80 dark:border-white/15 dark:bg-white/[0.04] dark:text-neutral-100 dark:hover:bg-white/[0.09]'
        }`}
        aria-label={label}
        aria-pressed={isPlaying}
        title={playbackError ? `请检查音频文件：${musicConfig.src}` : `${label}：${musicConfig.title}`}
      >
        <span aria-hidden="true" className={`leading-none transition-opacity ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {isPlaying ? '♫' : '♪'}
        </span>
        {isPlaying && <span className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />}
      </button>
    </>
  )
}
