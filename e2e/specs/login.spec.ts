import { test, expect } from '@playwright/test'

test.describe('登录页', () => {
  test('页面能正常打开并显示登录表单', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('鑫渠 CRM')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('空表单提交时显示错误提示', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=请输入用户名和密码')).toBeVisible()
  })
})
