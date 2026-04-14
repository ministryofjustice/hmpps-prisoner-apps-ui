import { expect, test } from '@playwright/test'
import managingAppsApi from '../mockApis/managingAppsApi'

import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import ExamplePage from '../pages/examplePage'

test.describe('Example', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Applications page is visible after login', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page)

    await ExamplePage.verifyOnPage(page)
  })

  test('Managing apps API failure shows error page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps(500)

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    await expect(page.locator('h1', { hasText: 'Internal Server Error' })).toBeVisible()
  })
})
