import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { GlassButton } from '../../../components/ui/GlassButton'
import type { Photo } from '../../../data/photos'
import { filmChapters, filmCopy, filmRuntimeLabel, type FilmStatus } from '../config/filmConfig'

interface FilmIntroProps {
  previewPhotos: Photo[]
  photoCount: number
  readyPhotoCount: number
  minimumReadyPhotos: number
  status: FilmStatus
  error: string | null
  onStart: () => void
  onBack: () => void
}

export function FilmIntro({
  previewPhotos,
  photoCount,
  readyPhotoCount,
  minimumReadyPhotos,
  status,
  error,
  onStart,
  onBack,
}: FilmIntroProps) {
  const introRef = useRef<HTMLElement>(null)
  const isReady = status === 'ready' && !error && photoCount > 0
  const isLoading = status === 'loading'
  const heroPhoto = previewPhotos[Math.floor(previewPhotos.length / 2)]
  const sidePhotos = previewPhotos
    .filter((photo) => photo.id !== heroPhoto?.id)
    .slice(0, 6)

  useLayoutEffect(() => {
    const intro = introRef.current
    if (!intro) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      const topbarItems = intro.querySelectorAll('.memory-film-intro-topbar > *')
      const hero = intro.querySelector('.memory-film-gate-photo--hero')
      const sideCards = intro.querySelectorAll('.memory-film-gate-photo--side')
      const copyItems = intro.querySelectorAll('.memory-film-intro-copy > *')
      const actionCluster = intro.querySelector('.memory-film-intro-action-cluster')
      const chapterItems = intro.querySelectorAll('.memory-film-intro-chapters > li')

      if (reducedMotion) {
        const reducedTargets = [
          ...Array.from(topbarItems),
          ...(hero ? [hero] : []),
          ...Array.from(sideCards),
          ...Array.from(copyItems),
          ...(actionCluster ? [actionCluster] : []),
          ...Array.from(chapterItems),
        ]
        gsap.set(reducedTargets, { opacity: 1 })
        return
      }

      const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } })
      timeline.fromTo(topbarItems, {
        opacity: 0,
        y: -10,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.055,
        ease: 'power3.out',
      }, 0.04)
      if (hero) {
        timeline.fromTo(hero, {
          opacity: 0,
          clipPath: 'inset(8% 10% 8% 10% round 30px)',
        }, {
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0% round 24px)',
          duration: 0.96,
          ease: 'expo.out',
        }, 0.08)
      }
      timeline.fromTo(sideCards, {
        opacity: 0,
        clipPath: 'inset(5% 18% 5% 18% round 24px)',
      }, {
        opacity: 0.84,
        clipPath: 'inset(0% 0% 0% 0% round 24px)',
        duration: 0.76,
        stagger: { each: 0.07, from: 'center' },
        ease: 'expo.out',
      }, 0.18)
      timeline.fromTo(copyItems, {
        opacity: 0,
        y: 16,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.075,
        ease: 'expo.out',
      }, 0.34)
      if (actionCluster) {
        timeline.fromTo(actionCluster, {
          opacity: 0,
          y: 14,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.58,
          ease: 'expo.out',
        }, 0.48)
      }
      timeline.fromTo(chapterItems, {
        opacity: 0,
        y: 8,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.46,
        stagger: 0.045,
        ease: 'power3.out',
      }, 0.56)
    }, intro)

    return () => context.revert()
  }, [])

  return (
    <section ref={introRef} className="memory-film-intro" aria-labelledby="memory-film-title">
      <header className="memory-film-intro-topbar">
        <GlassButton className="memory-film-back" href="/" onClick={onBack} ariaLabel="返回四年相册">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M19 12H5m6-6-6 6 6 6" />
          </svg>
          <span>返回相册</span>
        </GlassButton>

        <div className="memory-film-intro-period" aria-label={`回忆时间 ${filmCopy.period}`}>
          <span>{filmCopy.period}</span>
          <i aria-hidden="true" />
          <span>四年共同影像</span>
        </div>

        <p className="memory-film-intro-count">
          <strong>{String(photoCount).padStart(2, '0')}</strong>
          <span>张照片</span>
          <i aria-hidden="true" />
          <span>约 {filmRuntimeLabel}</span>
        </p>
      </header>

      <div className="memory-film-gate" aria-hidden="true">
        <div className="memory-film-gate-motion">
          <div className="memory-film-gate-reflection" />
          {sidePhotos.map((photo, index) => (
            <figure
              className="memory-film-gate-photo memory-film-gate-photo--side"
              data-side={index < Math.ceil(sidePhotos.length / 2) ? 'left' : 'right'}
              key={photo.id}
              style={{ '--gate-index': index } as CSSProperties}
            >
              <img
                src={photo.src}
                alt=""
                loading={index < 3 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(event) => { event.currentTarget.closest('figure')?.setAttribute('data-error', 'true') }}
              />
            </figure>
          ))}
          <figure className="memory-film-gate-photo memory-film-gate-photo--hero">
            <img src={heroPhoto?.src ?? '/images/photo-together.jpg'} alt="" loading="eager" decoding="async" />
          </figure>
        </div>
      </div>

      <div className="memory-film-intro-copy">
        <p className="memory-film-wordmark">Memory Uni · Memory Film</p>
        <h1 id="memory-film-title">把四年，<br />重新放映一次。</h1>
        <p className="memory-film-intro-summary">同一批真实照片，将在七段镜头里重新相遇。</p>
      </div>

      <div className="memory-film-intro-action-cluster">
        <div className="memory-film-intro-ready">
          <span className="memory-film-ready-dot" data-ready={isReady ? 'true' : 'false'} aria-hidden="true" />
          {error ? (
            <p className="memory-film-status" role="status">共同回忆暂时没有准备好，请稍后再试。</p>
          ) : photoCount === 0 && !isLoading ? (
            <p className="memory-film-status">相册里还没有可以播放的回忆。</p>
          ) : isLoading ? (
            <p className="memory-film-status" role="status" aria-live="polite">
              正在整理照片{minimumReadyPhotos > 0 ? ` · ${Math.min(readyPhotoCount, minimumReadyPhotos)}/${minimumReadyPhotos}` : ''}
            </p>
          ) : (
            <p className="memory-film-status">照片就绪 · 将尝试进入全屏并播放音乐</p>
          )}
        </div>

        <GlassButton
          className="memory-film-action memory-film-action--primary"
          onClick={onStart}
          disabled={!isReady}
          ariaLabel="开始播放沉浸式回忆"
        >
          <span className="memory-film-action-icon" aria-hidden="true">
            {isReady ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 7 8 5-8 5V7Z" /></svg>
            ) : (
              <span className="memory-film-action-loader" />
            )}
          </span>
          <span>{isReady ? '开始放映' : '正在准备'}</span>
        </GlassButton>
      </div>

      <ol className="memory-film-intro-chapters" aria-label="影片七个章节">
        {filmChapters.map((chapter, index) => (
          <li key={chapter.scene} data-active={index === 0 ? 'true' : 'false'}>
            <span className="memory-film-intro-chapter-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="memory-film-intro-chapter-name">{chapter.label}</span>
            <span className="memory-film-intro-wave" aria-hidden="true">
              {Array.from({ length: 9 }, (_, tick) => <i key={tick} />)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
