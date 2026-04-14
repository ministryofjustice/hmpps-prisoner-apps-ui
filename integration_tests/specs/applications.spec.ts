import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'

test.describe('Applications', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows prisoner applications on the apps page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    await expect(page.getByRole('heading', { name: 'Apps', level: 1 })).toBeVisible()

    await expect(page.locator('[data-qa="app-results-table"]')).toBeVisible()
  })
})
