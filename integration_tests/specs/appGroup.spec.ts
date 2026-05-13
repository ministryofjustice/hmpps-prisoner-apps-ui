import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'

test.describe('App group', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows app groups on the page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await page.goto('/log/group')

    await expect(page.getByRole('heading', { name: 'Select app group', level: 1 })).toBeVisible()
    await expect(page.getByLabel('Pin Phone Contact Apps')).toBeVisible()
  })

  test('shows validation error when no group is selected', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await page.goto('/log/group')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('link', { name: 'Choose an app group' })).toBeVisible()
    await expect(page.locator('#group-error')).toContainText('Choose an app group')
  })

  test('redirects to app type page when a group is selected', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await page.goto('/log/group')
    await page.getByLabel('Pin Phone Contact Apps').check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL('/log/type')
  })

  test('shows error page when groups API fails', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes(500)
    await loginWithPrisonerAuth(page)

    await page.goto('/log/group')

    await expect(page.locator('h1', { hasText: 'Internal Server Error' })).toBeVisible()
  })
})
