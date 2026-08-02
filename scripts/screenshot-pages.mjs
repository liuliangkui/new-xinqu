import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseUrl = process.env.BASE_URL || 'http://localhost:5173'
const outDir = resolve(__dirname, '../screenshots')

const pages = [
  { path: '/favorites', name: 'favorites' },
  { path: '/config', name: 'config' },
  { path: '/designer', name: 'designer' },
  { path: '/brand', name: 'brand' },
  { path: '/reagent', name: 'reagent' },
  { path: '/compliance', name: 'compliance' },
  { path: '/dealer', name: 'dealer' },
  { path: '/kanban', name: 'kanban' },
  { path: '/message', name: 'message' },
  { path: '/settings', name: 'settings' },
]

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

  for (const p of pages) {
    await page.goto(`${baseUrl}${p.path}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: resolve(outDir, `${p.name}.png`), fullPage: false })
    console.log(`screenshot: ${p.name}.png`)
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
