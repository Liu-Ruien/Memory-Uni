import { chromium } from 'file:///C:/Users/YeMing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import path from 'node:path'

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--disable-gpu', '--no-first-run'],
})
const page = await browser.newPage({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.goto('http://127.0.0.1:4174/memory-film', { waitUntil: 'networkidle' })
await page.waitForFunction(() => {
  const button = document.querySelector('button[aria-label="开始播放沉浸式回忆"]')
  return button instanceof HTMLButtonElement && !button.disabled
}, null, { timeout: 30000 })
await page.waitForTimeout(700)
await page.screenshot({ path: path.resolve('.impeccable/review/hero-repro.png'), fullPage: true })
await browser.close()
process.stdout.write(`${JSON.stringify({ viewport: '1672x941', errors })}\n`)
