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

await page.goto('http://127.0.0.1:4174/memory-film?filmSpeed=4', { waitUntil: 'networkidle' })
const play = page.getByRole('button', { name: '开始播放沉浸式回忆' })
await page.waitForFunction(() => {
  const button = document.querySelector('button[aria-label="开始播放沉浸式回忆"]')
  return button instanceof HTMLButtonElement && !button.disabled
}, null, { timeout: 30000 })
await play.click()

async function inspectScene(scene, delay, shotName) {
  await page.waitForFunction((expected) => document.querySelector('.memory-film-stage')?.getAttribute('data-scene') === expected, scene, { timeout: 15000 })
  await page.waitForTimeout(delay)
  await page.screenshot({ path: path.resolve('.impeccable/review', shotName) })
  return page.evaluate(() => {
    const viewport = { width: innerWidth, height: innerHeight }
    return Array.from(document.querySelectorAll('.memory-film-photo-card')).map((card, index) => {
      const rect = card.getBoundingClientRect()
      const style = getComputedStyle(card)
      return {
        index,
        opacity: Number.parseFloat(style.opacity),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        intersectsViewport: rect.right > 0 && rect.bottom > 0 && rect.left < viewport.width && rect.top < viewport.height,
        transform: style.transform,
      }
    }).filter((card) => card.opacity > 0.08).sort((a, b) => b.rect.width - a.rect.width).slice(0, 6)
  })
}

const tunnelEarly = await inspectScene('memory-tunnel', 220, 'desktop-tunnel-early.png')
const tunnelMid = await inspectScene('memory-tunnel', 720, 'desktop-tunnel-mid.png')
const gathering = await inspectScene('final-gathering', 260, 'desktop-gathering.png')

await browser.close()
process.stdout.write(`${JSON.stringify({ errors, tunnelEarly, tunnelMid, gathering }, null, 2)}\n`)
