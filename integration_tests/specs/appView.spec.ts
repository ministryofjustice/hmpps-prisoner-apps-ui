import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'

test.describe('App view', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('clicking View from app list opens submitted app page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await loginWithPrisonerAuth(page)

    await page.goto('/applications')
    await expect(page.locator('[data-qa="app-results-table"]')).toBeVisible()

    await page.getByRole('link', { name: 'View' }).first().click()

    await expect(page).toHaveURL('/applications/1')
    await expect(page.getByRole('heading', { name: 'Make a general PIN phone enquiry', level: 1 })).toBeVisible()
    await expect(page.getByText('This application has been received and will be processed soon.')).toBeVisible()
    await expect(page.getByText('Testing general PIN phone enquiry')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back to apps home' })).toBeVisible()
  })
})
