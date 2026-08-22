import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { GlassButton } from '../../../components/ui/GlassButton'
import type { Photo } from '../../../data/photos'
import { filmChapters, filmCopy, filmDurations, filmRuntimeLabel } from '../config/filmConfig'
import { filmMotion } from '../config/filmMotion'
import { addFilmTextScenes } from '../scenes/filmTextScenes'
import { addFinalGatheringScene } from '../scenes/finalGathering'
import { addHorizontalStreamScene } from '../scenes/horizontalStream'
import { addMemoryRingScene } from '../scenes/memoryRing'
import { addMemoryTunnelScene } from '../scenes/memoryTunnel'
import { addPhotoWallScene } from '../scenes/photoWall'
import { addScatterScene } from '../scenes/scatter'
import { FilmPhotoScheduler } from '../utils/FilmPhotoScheduler'
import { runSyntheticLayoutDiagnostics } from '../utils/layoutDiagnostics'
import {
  createFinalGatheringLayout,
  createHorizontalStreamLayout,
  createMemoryRingLayout,
  createMemoryTunnelLayout,
  createPhotoWallLayout,
  createScatterLayout,
} from '../utils/photoLayout'
import { FilmPhotoCard } from './FilmPhotoCard'
import type { FilmAtmosphereScene } from './MemoryFilmBackground'

interface FilmStageProps {
  photos: Photo[]
  playbackKey: number
  isMobile: boolean
  onPreloadPhotos: (photos: Photo[]) => void
  onComplete: () => void
  onReplay: () => void
  onBack: () => void
  onSceneChange: (scene: FilmAtmosphereScene) => void
}

function difference(source: HTMLElement[], active: HTMLElement[]) {
  const activeSet = new Set(active)
  return source.filter((element) => !activeSet.has(element))
}

function formatFilmTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

const endingCopy = [
  <>我们拍了很多照片。</>,
  <>有些很认真，<br />有些很模糊，<br />有些甚至已经想不起<br />当时为什么要拍。</>,
  <>后来才发现，<br />真正舍不得的，<br />从来不是某一张照片。</>,
  <>而是照片里的那段时间。</>,
]

let hasLoggedSyntheticDiagnostics = false

export function FilmStage({
  photos,
  playbackKey,
  isMobile,
  onPreloadPhotos,
  onComplete,
  onReplay,
  onBack,
  onSceneChange,
}: FilmStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const labelRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const gatheringTitleRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const progressFillRef = useRef<HTMLSpanElement>(null)
  const progressHeadRef = useRef<HTMLElement>(null)
  const elapsedTimeRef = useRef<HTMLSpanElement>(null)
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([])
  const eraTitleRef = useRef<HTMLDivElement>(null)
  const endingTextRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const creditsRef = useRef<HTMLDivElement>(null)
  const finalMessageRef = useRef<HTMLDivElement>(null)
  const endingUiRef = useRef<HTMLDivElement>(null)
  const scheduler = useMemo(() => new FilmPhotoScheduler(photos, isMobile), [isMobile, photos])
  const priorityIds = useMemo(() => new Set(scheduler.getWallPhotos().map((photo) => photo.id)), [scheduler])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const plane = planeRef.current
    const gatheringTitle = gatheringTitleRef.current
    const hud = hudRef.current
    const progressFill = progressFillRef.current
    const progressHead = progressHeadRef.current
    const endingUi = endingUiRef.current
    const allCards = cardRefs.current.filter((card): card is HTMLDivElement => Boolean(card))
    if (!stage || !plane || !endingUi || allCards.length === 0) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const bounds = stage.getBoundingClientRect()
    const indexById = new Map(photos.map((photo, index) => [photo.id, index]))
    const cardsFor = (batch: Photo[]) => batch
      .map((photo) => cardRefs.current[indexById.get(photo.id) ?? -1])
      .filter((card): card is HTMLDivElement => Boolean(card))

    const wallPhotos = scheduler.getWallPhotos()
    const scatterPhotos = scheduler.getScatterPhotos()
    const streamPhotos = scheduler.getStreamPhotos()
    const ringPhotos = scheduler.getRingPhotos()
    const tunnelPhotos = scheduler.getTunnelPhotos()
    const finalPhotos = scheduler.getFinalPhotos()
    const wallCards = cardsFor(wallPhotos)
    const scatterCards = cardsFor(scatterPhotos)
    const streamCards = cardsFor(streamPhotos)
    const ringCards = cardsFor(ringPhotos)
    const tunnelCards = cardsFor(tunnelPhotos)
    const finalCards = cardsFor(finalPhotos)

    const wallLayout = createPhotoWallLayout(bounds.width, bounds.height, wallCards.length)
    const scatterLayout = createScatterLayout(wallLayout.metrics, scatterCards.length)
    const streamLayout = createHorizontalStreamLayout(wallLayout.metrics, streamCards.length)
    const ringLayout = createMemoryRingLayout(wallLayout.metrics, ringCards.length)
    const tunnelLayout = createMemoryTunnelLayout(wallLayout.metrics, tunnelCards.length)
    const gatheringLayout = createFinalGatheringLayout(bounds.width, bounds.height, finalCards.length)

    stage.dataset.wallColumns = String(wallLayout.columns)
    stage.dataset.wallRows = String(wallLayout.rows)
    stage.dataset.streamLanes = String(streamLayout.laneCount)
    stage.dataset.ringCards = String(ringCards.length)
    stage.dataset.tunnelCards = String(tunnelCards.length)
    stage.dataset.finalCards = String(finalCards.length)
    streamCards.forEach((card, index) => {
      card.dataset.streamLane = String(streamLayout.placements[index]?.lane ?? 0)
    })

    if (import.meta.env.DEV) {
      console.debug(`[Memory Film density]\n${JSON.stringify(scheduler.getDebugSnapshot(), null, 2)}`)
      console.debug(`[Memory Film layouts]\n${JSON.stringify({
        wall: `${wallLayout.rows} rows / max ${wallLayout.columns}`,
        streamLanes: streamLayout.laneCount,
        ring: ringCards.length,
        tunnel: tunnelCards.length,
        final: gatheringLayout.tierCounts,
      }, null, 2)}`)
      console.debug(`[Memory Film visual diagnostics]\n${JSON.stringify({
        wallCardAverageWidth: Math.round(wallLayout.metrics.cardWidth),
        ribbonCardAverageWidth: Math.round(streamLayout.cardWidth),
        ringHeroWidth: Math.round(ringLayout.heroWidth),
        tunnelScaleRange: [
          Number(Math.min(...tunnelLayout.map((placement) => placement.scale)).toFixed(2)),
          Number(Math.max(...tunnelLayout.map((placement) => placement.endScale)).toFixed(2)),
        ],
        finalLayers: gatheringLayout.tierCounts,
      }, null, 2)}`)
      if (!hasLoggedSyntheticDiagnostics) {
        hasLoggedSyntheticDiagnostics = true
        console.debug(`[Memory Film synthetic layouts]\n${JSON.stringify(runSyntheticLayoutDiagnostics(), null, 2)}`)
      }
    }

    const wallStart = 0
    const scatterTransitionStart = filmDurations.introTransition + filmDurations.photoWall
    const scatterHoldStart = scatterTransitionStart + filmDurations.wallToScatter
    const streamTransitionStart = scatterHoldStart + filmDurations.scatterHold
    const streamMotionStart = streamTransitionStart + filmDurations.scatterToStream
    const ringTransitionStart = streamMotionStart + filmDurations.horizontalStream
    const tunnelTransitionStart = ringTransitionStart + filmDurations.ringTransition + filmDurations.ringOrbit
    const gatheringTransitionStart = tunnelTransitionStart + filmDurations.tunnelTransition + filmDurations.tunnelTravel
    const ringMotionStart = ringTransitionStart - filmMotion.chapterOverlap.streamToRing
    const tunnelMotionStart = tunnelTransitionStart - filmMotion.chapterOverlap.ringToTunnel
    const gatheringMotionStart = gatheringTransitionStart - filmMotion.chapterOverlap.tunnelToGathering
    const photoDissolveStart = gatheringTransitionStart + filmDurations.gatheringTransition + filmDurations.gatheringHold
    const textStart = photoDissolveStart + filmDurations.photoDissolve
    const filmDuration = textStart
      + filmDurations.eraTitle
      + filmDurations.endingText
      + filmDurations.credits
      + filmDurations.finalBlack
      + filmDurations.finalMessage
      + filmDurations.endingUi

    stage.dataset.filmDuration = String(filmDuration)

    const context = gsap.context(() => {
      gsap.set(allCards, {
        width: wallLayout.metrics.cardWidth,
        xPercent: -50,
        yPercent: -50,
      })
      gsap.set([
        gatheringTitle,
        eraTitleRef.current,
        ...endingTextRefs.current,
        creditsRef.current,
        finalMessageRef.current,
        endingUi,
      ].filter(Boolean), { opacity: 0, visibility: 'hidden', pointerEvents: 'none' })
      gsap.set(plane, {
        transformOrigin: '50% 50%',
        x: 0,
        y: 0,
        z: reducedMotion ? 0 : -10,
        rotationZ: 0,
        scale: reducedMotion ? 1 : 0.976,
        force3D: true,
      })
      if (progressFill) gsap.set(progressFill, { scaleX: 0, transformOrigin: '0% 50%' })
      if (progressHead) gsap.set(progressHead, { x: 0, scale: 0.82, opacity: 0.72 })

      const timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete,
        onUpdate: () => {
          if (elapsedTimeRef.current) elapsedTimeRef.current.textContent = formatFilmTime(timeline.time())
        },
      })
      if (import.meta.env.DEV) {
        const requestedSpeed = Number(new URLSearchParams(window.location.search).get('filmSpeed') ?? 1)
        if (Number.isFinite(requestedSpeed) && requestedSpeed > 1) timeline.timeScale(Math.min(8, requestedSpeed))
      }
      const mergeCards = (...groups: HTMLDivElement[][]) => Array.from(new Set(groups.flat()))
      const promoteCards = (activeCards: HTMLDivElement[]) => {
        const activeSet = new Set(activeCards)
        allCards.forEach((card) => {
          card.style.willChange = activeSet.has(card)
            ? reducedMotion ? 'opacity' : 'transform, opacity'
            : 'auto'
        })
      }
      const markScene = (scene: string) => {
        stage.dataset.scene = scene
        const normalizedScene = scene === 'photo-dissolve' ? 'final-gathering' : scene
        const chapterIndex = filmChapters.findIndex((chapter) => chapter.scene === normalizedScene)
        stage.dataset.chapterIndex = String(Math.max(0, chapterIndex))
        chapterRefs.current.forEach((chapter, index) => {
          if (!chapter) return
          chapter.dataset.state = index < chapterIndex ? 'complete' : index === chapterIndex ? 'active' : 'upcoming'
        })
        onSceneChange(normalizedScene === 'film-text' ? 'film-text' : normalizedScene as FilmAtmosphereScene)
        if (import.meta.env.DEV) console.debug(`[Memory Film scene] ${scene}`)
      }

      timeline.call(() => promoteCards(wallCards), [], wallStart)
      timeline.call(
        () => promoteCards(mergeCards(wallCards, scatterCards)),
        [],
        Math.max(wallStart, scatterTransitionStart - 0.18),
      )
      timeline.call(
        () => promoteCards(scatterCards),
        [],
        scatterTransitionStart + filmDurations.wallToScatter + 0.04,
      )
      timeline.call(
        () => promoteCards(mergeCards(scatterCards, streamCards)),
        [],
        Math.max(wallStart, streamTransitionStart - 0.16),
      )
      timeline.call(
        () => promoteCards(streamCards),
        [],
        streamTransitionStart + filmDurations.scatterToStream + 0.04,
      )
      timeline.call(
        () => promoteCards(mergeCards(streamCards, ringCards)),
        [],
        Math.max(wallStart, ringMotionStart - 0.14),
      )
      timeline.call(
        () => promoteCards(ringCards),
        [],
        ringMotionStart + filmDurations.ringTransition + 0.04,
      )
      timeline.call(
        () => promoteCards(mergeCards(ringCards, tunnelCards)),
        [],
        Math.max(wallStart, tunnelMotionStart - 0.14),
      )
      timeline.call(
        () => promoteCards(tunnelCards),
        [],
        tunnelMotionStart + filmDurations.tunnelTransition + 0.04,
      )
      timeline.call(
        () => promoteCards(mergeCards(tunnelCards, finalCards)),
        [],
        Math.max(wallStart, gatheringMotionStart - 0.14),
      )
      timeline.call(
        () => promoteCards(finalCards),
        [],
        gatheringMotionStart + filmDurations.gatheringTransition + 0.04,
      )
      timeline.call(() => promoteCards([]), [], photoDissolveStart + filmDurations.photoDissolve)

      timeline.call(() => markScene('photo-wall'), [], wallStart)
      timeline.call(() => markScene('controlled-scatter'), [], scatterTransitionStart)
      timeline.call(() => markScene('horizontal-stream'), [], streamTransitionStart)
      timeline.call(() => markScene('memory-ring'), [], ringTransitionStart)
      timeline.call(() => markScene('memory-tunnel'), [], tunnelTransitionStart)
      timeline.call(() => markScene('final-gathering'), [], gatheringTransitionStart)
      timeline.call(() => markScene('photo-dissolve'), [], photoDissolveStart)
      timeline.call(() => markScene('film-text'), [], textStart)
      if (progressFill) {
        timeline.to(progressFill, { scaleX: 1, duration: filmDuration, ease: 'none' }, 0)
      }
      if (progressHead) {
        const track = progressHead.parentElement
        const travel = Math.max(0, (track?.getBoundingClientRect().width ?? 0) - 7)
        timeline.to(progressHead, { x: travel, opacity: 1, scale: 1, duration: filmDuration, ease: 'none' }, 0)
      }

      addPhotoWallScene({
        timeline,
        cards: wallCards,
        label: labelRefs.current[0],
        layout: wallLayout,
        startAt: wallStart,
        entranceDuration: filmDurations.introTransition,
        holdDuration: filmDurations.photoWall,
        reducedMotion,
      })
      addScatterScene({
        timeline,
        cards: scatterCards,
        label: labelRefs.current[1],
        placements: scatterLayout,
        transitionStart: scatterTransitionStart,
        transitionDuration: filmDurations.wallToScatter,
        holdDuration: filmDurations.scatterHold,
        reducedMotion,
      })
      addHorizontalStreamScene({
        timeline,
        cards: streamCards,
        outgoingCards: difference(scatterCards, streamCards),
        label: labelRefs.current[2],
        layout: streamLayout,
        transitionStart: streamTransitionStart,
        transitionDuration: filmDurations.scatterToStream,
        motionDuration: filmDurations.horizontalStream,
        reducedMotion,
      })
      addMemoryRingScene({
        timeline,
        cards: ringCards,
        outgoingCards: difference(streamCards, ringCards),
        layout: ringLayout,
        baseCardWidth: wallLayout.metrics.cardWidth,
        transitionStart: ringMotionStart,
        transitionDuration: filmDurations.ringTransition,
        orbitDuration: filmDurations.ringOrbit,
        reducedMotion,
      })
      addMemoryTunnelScene({
        timeline,
        cards: tunnelCards,
        outgoingCards: difference(ringCards, tunnelCards),
        placements: tunnelLayout,
        transitionStart: tunnelMotionStart,
        transitionDuration: filmDurations.tunnelTransition,
        travelDuration: filmDurations.tunnelTravel,
        reducedMotion,
      })
      addFinalGatheringScene({
        timeline,
        cards: finalCards,
        dormantCards: difference(finalCards, tunnelCards),
        layout: gatheringLayout,
        baseCardWidth: wallLayout.metrics.cardWidth,
        title: gatheringTitle,
        transitionStart: gatheringMotionStart,
        transitionDuration: filmDurations.gatheringTransition,
        holdDuration: filmDurations.gatheringHold,
        reducedMotion,
      })

      // Scene-aware preloading is driven by the same timeline, never by independent timers.
      timeline.call(() => onPreloadPhotos(ringPhotos), [], Math.max(0, streamTransitionStart - 0.4))
      timeline.call(() => onPreloadPhotos(tunnelPhotos), [], ringTransitionStart + 1)
      timeline.call(() => onPreloadPhotos(finalPhotos), [], tunnelTransitionStart + 1)

      if (!reducedMotion) {
        timeline.to(plane, {
          x: 0,
          y: -3,
          z: 18,
          rotationZ: 0.08,
          scale: 1.018,
          duration: Math.max(0.5, scatterTransitionStart - 0.22),
          ease: filmMotion.ease.drift,
        }, wallStart)
        timeline.to(plane, {
          x: -12,
          y: 8,
          z: -52,
          rotationZ: -0.22,
          scale: 0.956,
          duration: filmDurations.wallToScatter + 0.18,
          ease: filmMotion.ease.handoff,
        }, scatterTransitionStart - 0.2)
        timeline.to(plane, {
          x: 10,
          y: -4,
          z: 0,
          rotationZ: 0.08,
          scale: 1,
          duration: filmDurations.scatterToStream + 0.24,
          ease: filmMotion.ease.handoff,
        }, streamTransitionStart - 0.18)
        timeline.to(plane, {
          x: -8,
          y: 2,
          z: 16,
          rotationZ: -0.06,
          scale: 1.018,
          duration: filmDurations.horizontalStream,
          ease: filmMotion.ease.drift,
        }, streamMotionStart)
        timeline.to(plane, {
          x: 0,
          y: 0,
          z: 34,
          rotationZ: 0.12,
          scale: 1.025,
          duration: filmDurations.ringTransition,
          ease: filmMotion.ease.handoff,
        }, ringMotionStart)
        timeline.to(plane, {
          x: 8,
          y: -4,
          z: 40,
          rotationZ: -0.08,
          scale: 1.03,
          duration: filmDurations.ringOrbit,
          ease: filmMotion.ease.drift,
        }, ringMotionStart + filmDurations.ringTransition)
        timeline.to(plane, {
          x: 0,
          y: 0,
          z: 78,
          rotationZ: 0,
          scale: 1.062,
          duration: filmDurations.tunnelTransition + filmDurations.tunnelTravel * 0.78,
          ease: 'power2.in',
        }, tunnelMotionStart)
        timeline.to(plane, {
          x: 0,
          y: 0,
          z: 0,
          rotationZ: 0,
          scale: 1,
          duration: filmDurations.gatheringTransition,
          ease: filmMotion.ease.enter,
        }, gatheringMotionStart)
      }

      timeline.to(finalCards, reducedMotion ? {
        opacity: 0,
        duration: 0.24,
        ease: 'power2.out',
      } : {
        opacity: 0,
        y: (index: number) => `-=${8 + (index % 4) * 3}`,
        z: (index: number) => `-=${24 + (index % 3) * 12}`,
        rotation: (index: number) => `+=${index % 2 === 0 ? -0.6 : 0.6}`,
        scale: 0.92,
        duration: filmDurations.photoDissolve,
        stagger: { each: 0.014, from: 'center' },
        ease: filmMotion.ease.leave,
      }, photoDissolveStart)

      const filmEnd = addFilmTextScenes({
        timeline,
        eraTitle: eraTitleRef.current,
        endingTexts: endingTextRefs.current.filter((text): text is HTMLParagraphElement => Boolean(text)),
        credits: creditsRef.current,
        finalMessage: finalMessageRef.current,
        endingUi,
        startAt: textStart,
        eraDuration: filmDurations.eraTitle,
        endingTextDuration: filmDurations.endingText,
        creditsDuration: filmDurations.credits,
        blackDuration: filmDurations.finalBlack,
        finalMessageDuration: filmDurations.finalMessage,
        endingUiDuration: filmDurations.endingUi,
        reducedMotion,
      })
      if (hud) {
        timeline.to(hud, {
          opacity: 0,
          pointerEvents: 'none',
          duration: reducedMotion ? 0.2 : 0.55,
          ease: 'power3.out',
        }, textStart + filmDurations.eraTitle + filmDurations.credits + filmDurations.endingText)
      }
      timeline.to({}, { duration: 0.01 }, filmEnd)
    }, stage)

    return () => {
      allCards.forEach((card) => card.style.removeProperty('will-change'))
      context.revert()
    }
  }, [isMobile, onComplete, onPreloadPhotos, onSceneChange, photos, playbackKey, scheduler])

  return (
    <section ref={stageRef} className="memory-film-stage" data-scene="photo-wall" aria-label="沉浸式回忆影片">
      <div ref={hudRef} className="memory-film-hud">
        <div className="memory-film-hud-top">
          <GlassButton className="memory-film-hud-back" href="/" onClick={onBack} ariaLabel="退出影片并返回相册">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M19 12H5m6-6-6 6 6 6" />
            </svg>
            <span>退出影片</span>
          </GlassButton>
          <p className="memory-film-hud-brand"><strong>Memory Film</strong><span>{filmCopy.period}</span></p>
          <p className="memory-film-hud-runtime"><span ref={elapsedTimeRef}>00:00</span><i aria-hidden="true" /><span>{filmRuntimeLabel}</span></p>
        </div>

        <div className="memory-film-hud-bottom" aria-hidden="true">
          <div className="memory-film-progress-track"><span ref={progressFillRef} /><i ref={progressHeadRef} /></div>
          <ol className="memory-film-chapter-track">
            {filmChapters.map((chapter, index) => (
              <li
                key={chapter.scene}
                ref={(element) => { chapterRefs.current[index] = element }}
                data-film-chapter={chapter.scene}
                data-state={index === 0 ? 'active' : 'upcoming'}
              >
                <i />
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{chapter.label}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="memory-film-scene-labels" aria-hidden="true">
        {['照片墙', '散落的片段', '时间向前'].map((label, index) => (
          <p key={label} ref={(element) => { labelRefs.current[index] = element }}>{label}</p>
        ))}
      </div>

      <div ref={planeRef} className="memory-film-card-plane">
        {photos.map((photo, index) => (
          <FilmPhotoCard
            key={photo.id}
            ref={(element) => { cardRefs.current[index] = element }}
            photo={photo}
            priority={priorityIds.has(photo.id)}
          />
        ))}
      </div>

      <div ref={gatheringTitleRef} className="memory-film-gathering-title" aria-hidden="true">2022 — 2026</div>

      <div ref={eraTitleRef} className="memory-film-era-title">
        <h2>2022.09 — 2026.06</h2>
        <p>临沂大学 · 四年共同影像</p>
      </div>

      <div className="memory-film-ending-texts">
        {endingCopy.map((copy, index) => (
          <p key={index} ref={(element) => { endingTextRefs.current[index] = element }}>
            <span className="memory-film-letter-index">写给我们 · {String(index + 1).padStart(2, '0')}</span>
            <span className="memory-film-letter-copy">{copy}</span>
            <span className="memory-film-letter-period">2022 — 2026</span>
          </p>
        ))}
      </div>

      <div ref={creditsRef} className="memory-film-credits">
        <div className="memory-film-archive">
          <header>
            <h2>四年共同档案</h2>
            <p>Memory Timeline</p>
            <time>2022 — 2026</time>
          </header>
          <dl>
            <div><dt>大一 · 初见</dt><dd>第一次把陌生的名字，写进共同的故事。</dd></div>
            <div><dt>大二 · 探索</dt><dd>在熟悉的校园里，开始走向更远的地方。</dd></div>
            <div><dt>大三 · 沉淀</dt><dd>忙碌与成长，让我们慢慢成为想成为的人。</dd></div>
            <div><dt>大四 · 出发</dt><dd>带着四年的回声，走向各自的远方。</dd></div>
          </dl>
          <p className="memory-film-credit-thanks">照片留下的不是证据，<br />而是我们曾一起生活过的光。</p>
        </div>
      </div>

      <div ref={finalMessageRef} className="memory-film-final-message">
        <p>谢谢你们，<br />出现在我的大学四年里。</p>
        <span>2022.09 — 2026.06</span>
      </div>

      <div ref={endingUiRef} className="memory-film-ending">
        <p>{filmCopy.endingPeriod}</p>
        <h2>想再看一遍吗？</h2>
        <div className="memory-film-ending-actions">
          <GlassButton className="memory-film-action" onClick={onReplay} ariaLabel="再看一次">再看一次</GlassButton>
          <GlassButton className="memory-film-action memory-film-action--quiet" href="/" onClick={onBack} ariaLabel="返回相册">返回相册</GlassButton>
        </div>
      </div>
    </section>
  )
}
