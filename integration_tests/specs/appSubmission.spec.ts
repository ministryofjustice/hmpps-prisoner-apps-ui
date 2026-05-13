import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'

test.describe('App submission', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('submits one app type and shows confirmation page content', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await managingAppsApi.stubSubmitApp()
    await loginWithPrisonerAuth(page)

    await page.goto('/log/group')
    await page.getByLabel('Pin Phone Contact Apps').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/log/type')

    await page.getByLabel('Add emergency phone credit').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/log/application-details')

    await page.fill('input[name="amount"]', '10')
    await page.fill('textarea[name="reason"]', 'Emergency credit needed for family call')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/log/confirm')

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/log/confirmation')

    await expect(page.getByText('You have sent your app')).toBeVisible()
    await expect(page.getByText('Add emergency phone credit')).toBeVisible()
    await expect(page.getByText('You have sent a new app to staff.')).toBeVisible()
    await expect(page.getByText('Staff will process it as soon as possible.')).toBeVisible()

    await expect(page.getByRole('link', { name: 'send a new app' })).toHaveAttribute('href', '/log/group')
    await expect(page.getByRole('link', { name: 'this app' })).toHaveAttribute('href', '/applications/app-123')
    await expect(page.getByRole('link', { name: 'all your apps' })).toHaveAttribute('href', '/applications')
  })
})
