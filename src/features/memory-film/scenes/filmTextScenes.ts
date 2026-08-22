interface FilmTextSceneOptions {
  timeline: gsap.core.Timeline
  eraTitle: HTMLElement | null
  endingTexts: HTMLElement[]
  credits: HTMLElement | null
  finalMessage: HTMLElement | null
  endingUi: HTMLElement | null
  startAt: number
  eraDuration: number
  endingTextDuration: number
  creditsDuration: number
  blackDuration: number
  finalMessageDuration: number
  endingUiDuration: number
  reducedMotion: boolean
}

const enterEase = 'expo.out'
const leaveEase = 'power3.in'

export function addFilmTextScenes({
  timeline,
  eraTitle,
  endingTexts,
  credits,
  finalMessage,
  endingUi,
  startAt,
  eraDuration,
  endingTextDuration,
  creditsDuration,
  blackDuration,
  finalMessageDuration,
  endingUiDuration,
  reducedMotion,
}: FilmTextSceneOptions) {
  let cursor = startAt

  if (eraTitle) {
    timeline.set(eraTitle, { visibility: 'visible' }, cursor)
    timeline.fromTo(eraTitle, {
      opacity: 0,
      y: reducedMotion ? 0 : 8,
      scale: reducedMotion ? 1 : 0.99,
      letterSpacing: '0.07em',
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      letterSpacing: '0.11em',
      duration: reducedMotion ? 0.3 : 0.76,
      ease: enterEase,
    }, cursor)
    timeline.to(eraTitle, {
      opacity: 0,
      y: reducedMotion ? 0 : -6,
      letterSpacing: '0.13em',
      duration: reducedMotion ? 0.25 : 0.62,
      ease: leaveEase,
    }, cursor + eraDuration - 0.62)
  }
  cursor += eraDuration

  if (credits) {
    const archive = credits.querySelector<HTMLElement>('.memory-film-archive')
    const archiveItems = archive
      ? Array.from(archive.querySelectorAll<HTMLElement>('header > *, dl > div, .memory-film-credit-thanks'))
      : []
    timeline.set(credits, { visibility: 'visible', opacity: 1 }, cursor)
    timeline.fromTo(archive ?? credits, {
      opacity: 0,
      y: reducedMotion ? 0 : 28,
      rotationX: reducedMotion ? 0 : -4,
      scale: reducedMotion ? 1 : 0.97,
      transformPerspective: 1400,
    }, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      scale: 1,
      duration: reducedMotion ? 0.3 : 0.86,
      ease: enterEase,
    }, cursor)
    if (archiveItems.length > 0) {
      timeline.fromTo(archiveItems, {
        opacity: 0,
        y: reducedMotion ? 0 : 12,
      }, {
        opacity: 1,
        y: 0,
        duration: reducedMotion ? 0.22 : 0.52,
        stagger: reducedMotion ? 0 : 0.07,
        ease: enterEase,
      }, cursor + (reducedMotion ? 0.08 : 0.28))
    }
    timeline.to(archive ?? credits, {
      opacity: 0,
      y: reducedMotion ? 0 : -18,
      rotationX: reducedMotion ? 0 : 3,
      scale: reducedMotion ? 1 : 0.985,
      duration: reducedMotion ? 0.3 : 0.68,
      ease: leaveEase,
    }, cursor + creditsDuration - 0.68)
  }
  cursor += creditsDuration

  const perTextDuration = endingTextDuration / Math.max(1, endingTexts.length)
  endingTexts.forEach((text, index) => {
    const textStart = cursor + index * perTextDuration
    const direction = index % 2 === 0 ? -1 : 1
    timeline.set(text, {
      visibility: 'visible',
      transformOrigin: '50% 92%',
      transformPerspective: 1400,
    }, textStart)
    timeline.fromTo(text, {
      opacity: 0,
      y: reducedMotion ? 0 : 34,
      z: reducedMotion ? 0 : -90,
      rotationX: reducedMotion ? 0 : -5,
      rotationZ: reducedMotion ? 0 : direction * 1.05,
      scale: reducedMotion ? 1 : 0.965,
      clipPath: reducedMotion ? 'none' : 'inset(4% 0 0 0 round 24px)',
    }, {
      opacity: 1,
      y: 0,
      z: 0,
      rotationX: 0,
      rotationZ: 0,
      scale: 1,
      clipPath: 'inset(0% 0 0 0 round 24px)',
      duration: reducedMotion ? 0.28 : 0.86,
      ease: enterEase,
    }, textStart)
    timeline.to(text, {
      opacity: 0,
      y: reducedMotion ? 0 : -26,
      z: reducedMotion ? 0 : -58,
      rotationX: reducedMotion ? 0 : 4,
      rotationZ: reducedMotion ? 0 : direction * -0.45,
      scale: reducedMotion ? 1 : 0.982,
      duration: reducedMotion ? 0.24 : 0.64,
      ease: leaveEase,
    }, textStart + perTextDuration - 0.64)
  })
  cursor += endingTextDuration + blackDuration

  if (finalMessage) {
    const messageItems = Array.from(finalMessage.children) as HTMLElement[]
    timeline.set(finalMessage, { visibility: 'visible', opacity: 1 }, cursor)
    timeline.fromTo(messageItems, {
      opacity: 0,
      y: reducedMotion ? 0 : 14,
    }, {
      opacity: 1,
      y: 0,
      duration: reducedMotion ? 0.3 : 0.68,
      stagger: reducedMotion ? 0 : 0.12,
      ease: enterEase,
    }, cursor)
    timeline.to(messageItems, {
      opacity: 0,
      y: reducedMotion ? 0 : -9,
      duration: reducedMotion ? 0.26 : 0.58,
      stagger: reducedMotion ? 0 : 0.06,
      ease: leaveEase,
    }, cursor + finalMessageDuration - 0.64)
  }
  cursor += finalMessageDuration

  if (endingUi) {
    const endingItems = Array.from(endingUi.children) as HTMLElement[]
    timeline.set(endingUi, { visibility: 'visible', pointerEvents: 'auto', opacity: 1 }, cursor)
    timeline.fromTo(endingItems, {
      opacity: 0,
      y: reducedMotion ? 0 : 16,
    }, {
      opacity: 1,
      y: 0,
      duration: reducedMotion ? 0.3 : Math.min(0.72, endingUiDuration),
      stagger: reducedMotion ? 0 : 0.1,
      ease: enterEase,
    }, cursor)
  }

  return cursor + endingUiDuration
}
