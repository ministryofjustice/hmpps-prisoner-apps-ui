import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import ApplicationListPage from '../pages/applicationListPage'

test.describe('Applications', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Applications page is visible after login', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page)

    await ApplicationListPage.verifyOnPage(page)
  })

  test('Managing apps API failure shows error page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps(500)

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    await expect(page.locator('h1', { hasText: 'Internal Server Error' })).toBeVisible()
  })

  test('shows prisoner applications on the apps page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    await expect(page.getByRole('heading', { name: 'Apps', level: 1 })).toBeVisible()

    await expect(page.locator('[data-qa="app-results-table"]')).toBeVisible()
  })
})
