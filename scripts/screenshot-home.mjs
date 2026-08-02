import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseUrl = process.env.BASE_URL || 'http://localhost:5173'
const outDir = resolve(__dirname, '../screenshots')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  // 登录
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type="text"]').fill('admin')
  await page.locator('input[type="password"]').fill('admin')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(`${baseUrl}/`, { timeout: 10000 })
  await page.waitForTimeout(1000)

  await page.screenshot({ path: resolve(outDir, 'home.png'), fullPage: false })
  console.log('screenshot: home.png')

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
