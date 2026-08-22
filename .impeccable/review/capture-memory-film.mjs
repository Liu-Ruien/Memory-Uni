import { chromium } from 'file:///C:/Users/YeMing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import path from 'node:path'
import process from 'node:process'

const reviewDir = path.resolve('.impeccable/review')
const mobileOnly = process.argv.includes('--mobile-only')
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--disable-gpu', '--no-first-run'],
})

const report = {
  consoleErrors: [],
  failedRequests: [],
  shots: [],
  mobileDirect: {},
  mobileEntry: {},
  mobileMatrix: [],
}

async function createPage(viewport, mobileDevice = false) {
  const options = {
    viewport,
    screen: viewport,
    deviceScaleFactor: 1,
    isMobile: mobileDevice,
    hasTouch: mobileDevice,
  }
  if (mobileDevice) {
    options.userAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
  }
  const page = await browser.newPage(options)
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const location = message.location()
      report.consoleErrors.push(`${message.text()} :: ${location.url || 'unknown'}:${location.lineNumber ?? 0}`)
    }
  })
  page.on('requestfailed', (request) => {
    report.failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`)
  })
  page.on('response', (response) => {
    if (response.status() === 404) report.failedRequests.push(`${response.url()} :: 404`)
  })
  return page
}

async function prepareDesktop() {
  const page = await createPage({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:4174/memory-film?filmSpeed=6', { waitUntil: 'domcontentloaded' })
  await page.locator('.memory-film-intro').waitFor({ state: 'visible' })
  const playButton = page.getByRole('button', { name: '开始播放沉浸式回忆' })
  await playButton.waitFor({ state: 'visible' })
  await page.waitForFunction(() => {
    const button = document.querySelector('button[aria-label="开始播放沉浸式回忆"]')
    return button instanceof HTMLButtonElement && !button.disabled
  }, null, { timeout: 30000 })
  await page.waitForTimeout(700)
  return { page, playButton }
}

if (!mobileOnly) {
  const desktop = await prepareDesktop()
  await desktop.page.screenshot({ path: path.join(reviewDir, 'desktop.png'), fullPage: true })
  report.shots.push('desktop.png')
  await desktop.playButton.click()
  await desktop.page.waitForTimeout(4200)
  await desktop.page.mouse.move(120, 120)
  await desktop.page.screenshot({ path: path.join(reviewDir, 'desktop-playing.png'), fullPage: true })
  report.shots.push('desktop-playing.png')
  await desktop.page.waitForFunction(() => {
    const element = document.querySelector('.memory-film-credits')
    return element && Number.parseFloat(getComputedStyle(element).opacity) > 0.45
  }, null, { timeout: 12000 })
  await desktop.page.mouse.move(120, 120)
  await desktop.page.screenshot({ path: path.join(reviewDir, 'desktop-archive.png'), fullPage: true })
  report.shots.push('desktop-archive.png')
  await desktop.page.waitForFunction(() => Array.from(document.querySelectorAll('.memory-film-ending-texts p')).some((element) => Number.parseFloat(getComputedStyle(element).opacity) > 0.45), null, { timeout: 12000 })
  await desktop.page.mouse.move(120, 120)
  await desktop.page.screenshot({ path: path.join(reviewDir, 'desktop-letter.png'), fullPage: true })
  report.shots.push('desktop-letter.png')
  await desktop.page.close()
}

const mobileViewports = [
  { name: '320x568', width: 320, height: 568 },
  { name: '375x667', width: 375, height: 667 },
  { name: '667x375', width: 667, height: 375 },
  { name: '844x390', width: 844, height: 390 },
]

function isRectVisible(rect, viewport) {
  const subpixelTolerance = 2
  return Boolean(
    rect
    && rect.top >= -subpixelTolerance
    && rect.left >= -subpixelTolerance
    && rect.bottom <= viewport.height + subpixelTolerance
    && rect.right <= viewport.width + subpixelTolerance,
  )
}

for (const viewport of mobileViewports) {
  const size = { width: viewport.width, height: viewport.height }
  const directRequests = []
  const direct = await createPage(size, true)
  direct.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol === 'https:' && url.hostname.includes('supabase')) directRequests.push(request.url())
  })
  await direct.goto('http://127.0.0.1:4174/memory-film', { waitUntil: 'domcontentloaded' })
  await direct.locator('.memory-film-mobile-unavailable').waitFor({ state: 'visible' })
  const backAction = direct.getByRole('link', { name: '返回四年相册' })
  await backAction.scrollIntoViewIfNeeded()
  const backRect = await backAction.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
  })
  const directResult = {
    audioElements: await direct.locator('audio').count(),
    stageElements: await direct.locator('.memory-film-stage').count(),
    supabaseRequests: directRequests.length,
    path: new URL(direct.url()).pathname,
    backActionReachable: isRectVisible(backRect, size),
    scrollHeight: await direct.evaluate(() => document.documentElement.scrollHeight),
  }

  if (viewport.name === '375x667') {
    report.mobileDirect = directResult
    await direct.screenshot({ path: path.join(reviewDir, 'mobile.png') })
    report.shots.push('mobile.png')
  }
  if (viewport.name === '667x375') {
    await direct.screenshot({ path: path.join(reviewDir, 'mobile-landscape.png') })
    report.shots.push('mobile-landscape.png')
  }
  await direct.close()

  const entry = await createPage(size, true)
  await entry.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded' })
  const portal = entry.locator('.memory-film-portal')
  await portal.scrollIntoViewIfNeeded()
  await portal.click()
  const notice = entry.locator('.mobile-film-notice')
  await notice.waitFor({ state: 'visible' })
  await entry.waitForTimeout(350)
  const initialFocus = await entry.evaluate(() => {
    const element = document.activeElement
    if (!(element instanceof HTMLElement)) return null
    const rect = element.getBoundingClientRect()
    return {
      label: element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '',
      rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
    }
  })

  if (viewport.name === '375x667') {
    report.mobileEntry = {
      pathAfterClick: new URL(entry.url()).pathname,
      dialogCount: await entry.getByRole('dialog').count(),
      initialFocusLabel: initialFocus?.label,
    }
    await entry.screenshot({ path: path.join(reviewDir, 'mobile-film-notice.png') })
    report.shots.push('mobile-film-notice.png')
  }
  if (viewport.name === '667x375') {
    await entry.screenshot({ path: path.join(reviewDir, 'mobile-film-notice-landscape.png') })
    report.shots.push('mobile-film-notice-landscape.png')
  }

  await entry.keyboard.press('Shift+Tab')
  const wrappedLastFocusRect = await entry.evaluate(() => {
    const rect = document.activeElement?.getBoundingClientRect()
    return rect ? { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left } : null
  })
  if (viewport.name === '667x375') {
    await entry.screenshot({ path: path.join(reviewDir, 'mobile-film-notice-landscape-action.png') })
    report.shots.push('mobile-film-notice-landscape-action.png')
  }
  await entry.keyboard.press('Tab')
  await entry.keyboard.press('Escape')
  await entry.locator('.mobile-film-notice').waitFor({ state: 'detached' })
  const restoredFocusClass = await entry.evaluate(() => document.activeElement?.className ?? '')

  report.mobileMatrix.push({
    viewport: viewport.name,
    direct: directResult,
    entry: {
      pathAfterClick: new URL(entry.url()).pathname,
      initialFocusLabel: initialFocus?.label,
      initialFocusVisible: isRectVisible(initialFocus?.rect, size),
      wrappedLastFocusVisible: isRectVisible(wrappedLastFocusRect, size),
      focusRestoredToPortal: String(restoredFocusClass).includes('memory-film-portal'),
    },
  })
  await entry.close()
}

await browser.close()
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
