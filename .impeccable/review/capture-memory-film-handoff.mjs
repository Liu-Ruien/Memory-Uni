import { chromium } from 'file:///C:/Users/YeMing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import path from 'node:path'

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--disable-gpu', '--no-first-run'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })

await page.goto('http://127.0.0.1:4174/memory-film', { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => {
  const button = document.querySelector('button[aria-label="开始播放沉浸式回忆"]')
  return button instanceof HTMLButtonElement && !button.disabled
}, null, { timeout: 30000 })
const gateHeroSrc = await page.locator('.memory-film-gate-photo--hero img').getAttribute('src')
await page.getByRole('button', { name: '开始播放沉浸式回忆' }).click()

const frames = [
  ['handoff-01.png', 40],
  ['handoff-02.png', 90],
  ['handoff-03.png', 150],
  ['handoff-04.png', 240],
]
for (const [name, delay] of frames) {
  await page.waitForTimeout(delay)
  await page.screenshot({ path: path.resolve('.impeccable/review', name) })
}

const state = await page.evaluate(() => ({
  viewCount: document.querySelectorAll('.memory-film-view').length,
  scene: document.querySelector('.memory-film-stage')?.getAttribute('data-scene'),
  status: document.querySelector('.memory-film-page')?.getAttribute('data-film-status'),
  stageImageSources: Array.from(document.querySelectorAll('.memory-film-photo-image')).map((image) => image.getAttribute('src')),
}))
await browser.close()
process.stdout.write(`${JSON.stringify({
  errors,
  state: {
    viewCount: state.viewCount,
    scene: state.scene,
    status: state.status,
    gateHeroSrc,
    identityContinuesIntoStage: state.stageImageSources.includes(gateHeroSrc),
  },
  frames: frames.map(([name]) => name),
}, null, 2)}\n`)
