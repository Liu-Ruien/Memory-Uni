import { chromium } from 'file:///C:/Users/YeMing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import path from 'node:path'

const reviewDir = path.resolve('.impeccable/review')
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--disable-gpu', '--no-first-run'],
})

const report = {
  consoleErrors: [],
  failedRequests: [],
  transitionShots: [],
  normal: {},
  reducedMotion: {},
}

async function createFilmPage(reducedMotion = false) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    screen: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
  })
  if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' })
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => report.consoleErrors.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) => {
    report.failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`)
  })
  await page.goto('http://127.0.0.1:4174/memory-film?filmSpeed=8', { waitUntil: 'domcontentloaded' })
  const play = page.getByRole('button', { name: '开始播放沉浸式回忆' })
  try {
    await play.waitFor({ state: 'visible' })
  } catch (error) {
    await page.screenshot({ path: path.join(reviewDir, `desktop-${reducedMotion ? 'reduced' : 'normal'}-load-failure.png`) })
    process.stderr.write(`${await page.locator('body').innerText()}\n`)
    process.stderr.write(`${JSON.stringify(report.consoleErrors, null, 2)}\n`)
    throw error
  }
  await page.waitForFunction(() => {
    const button = document.querySelector('button[aria-label="开始播放沉浸式回忆"]')
    return button instanceof HTMLButtonElement && !button.disabled
  }, null, { timeout: 30000 })
  return { page, play }
}

if (process.argv.includes('--reduced-debug')) {
  const reducedDebug = await createFilmPage(true)
  process.stdout.write(`${JSON.stringify({
    body: await reducedDebug.page.locator('body').innerText(),
    coarsePointer: await reducedDebug.page.evaluate(() => matchMedia('(any-pointer: coarse)').matches),
    maxTouchPoints: await reducedDebug.page.evaluate(() => navigator.maxTouchPoints),
  }, null, 2)}\n`)
  await reducedDebug.page.close()
  await browser.close()
  process.exit(0)
}

const normal = await createFilmPage(false)
await normal.play.click()
for (const [name, delay] of [['transition-100ms.png', 100], ['transition-320ms.png', 220], ['transition-720ms.png', 400]]) {
  await normal.page.waitForTimeout(delay)
  await normal.page.screenshot({ path: path.join(reviewDir, name) })
  report.transitionShots.push(name)
}

const continuity = await normal.page.evaluate(() => new Promise((resolve) => {
  const startedAt = performance.now()
  const previous = new Map()
  const sceneMax = new Map()
  let visibleFrameCount = 0
  let blankFrameCount = 0

  const sample = () => {
    const stage = document.querySelector('.memory-film-stage')
    const scene = stage?.getAttribute('data-scene') ?? 'unknown'
    const cards = Array.from(document.querySelectorAll('.memory-film-photo-card')).slice(0, 20)
    let visibleCards = 0
    cards.forEach((card, index) => {
      const style = getComputedStyle(card)
      const opacity = Number.parseFloat(style.opacity)
      if (opacity <= 0.08) return
      visibleCards += 1
      const rect = card.getBoundingClientRect()
      const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const last = previous.get(index)
      if (last) {
        const distance = Math.hypot(point.x - last.x, point.y - last.y)
        sceneMax.set(scene, Math.max(sceneMax.get(scene) ?? 0, distance))
      }
      previous.set(index, point)
    })
    if (visibleCards > 0) visibleFrameCount += 1
    else if (scene !== 'film-text') blankFrameCount += 1

    const finished = document.querySelector('.memory-film-page')?.getAttribute('data-film-status') === 'finished'
    if (!finished && performance.now() - startedAt < 14000) {
      requestAnimationFrame(sample)
    } else {
      resolve({
        visibleFrameCount,
        blankFrameCount,
        maxFrameTravelByScene: Object.fromEntries(Array.from(sceneMax, ([key, value]) => [key, Math.round(value * 10) / 10])),
      })
    }
  }
  requestAnimationFrame(sample)
}))

await normal.page.waitForFunction(() => document.querySelector('.memory-film-page')?.getAttribute('data-film-status') === 'finished', null, { timeout: 18000 })
await normal.page.screenshot({ path: path.join(reviewDir, 'desktop-ending.png') })
const endingState = await normal.page.evaluate(() => ({
  scene: document.querySelector('.memory-film-stage')?.getAttribute('data-scene'),
  activeChapter: document.querySelector('.memory-film-chapter-track [data-state="active"]')?.getAttribute('data-film-chapter'),
  completedChapters: document.querySelectorAll('.memory-film-chapter-track [data-state="complete"]').length,
  endingPointerEvents: getComputedStyle(document.querySelector('.memory-film-ending')).pointerEvents,
}))
await normal.page.getByRole('button', { name: '再看一次' }).click()
await normal.page.waitForFunction(() => document.querySelector('.memory-film-stage')?.getAttribute('data-scene') === 'photo-wall')
const replayState = await normal.page.evaluate(() => ({
  status: document.querySelector('.memory-film-page')?.getAttribute('data-film-status'),
  scene: document.querySelector('.memory-film-stage')?.getAttribute('data-scene'),
  activeChapter: document.querySelector('.memory-film-chapter-track [data-state="active"]')?.getAttribute('data-film-chapter'),
}))
report.normal = { continuity, endingState, replayState }
await normal.page.close()

const reduced = await createFilmPage(true)
await reduced.play.click()
await reduced.page.waitForFunction(() => document.querySelector('.memory-film-page')?.getAttribute('data-film-status') === 'finished', null, { timeout: 18000 })
report.reducedMotion = await reduced.page.evaluate(() => ({
  status: document.querySelector('.memory-film-page')?.getAttribute('data-film-status'),
  scene: document.querySelector('.memory-film-stage')?.getAttribute('data-scene'),
  activeChapter: document.querySelector('.memory-film-chapter-track [data-state="active"]')?.getAttribute('data-film-chapter'),
  endingVisible: Number.parseFloat(getComputedStyle(document.querySelector('.memory-film-ending')).opacity) > 0.9,
}))
await reduced.page.close()

await browser.close()
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
