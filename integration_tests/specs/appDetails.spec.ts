import { expect, test, type Page } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import { groups } from '../../server/testData/groups/groups'

const navigateToAppDetails = async (page: Page, appTypeName: string) => {
  await page.goto('/log/group')
  await page.getByLabel('Pin Phone Contact Apps').check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL('/log/type')

  await page.getByLabel(appTypeName).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL('/log/application-details')
}

test.describe('App details', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows app details page with app type name and Add details heading', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)

    await expect(page.locator('.govuk-caption-xl')).toHaveText(appType.name)
    await expect(page.getByRole('heading', { name: 'Add details', level: 1 })).toBeVisible()
  })

  test('back link redirects to app type page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)
    await page.getByRole('link', { name: 'Back' }).click()

    await expect(page).toHaveURL('/log/type')
  })

  test('cancel link redirects to application list page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)
    await page.getByRole('link', { name: 'Cancel' }).click()

    await expect(page).toHaveURL('/applications')
  })

  groups[0].appTypes.forEach(appType => {
    test(`app details page shows form for "${appType.name}"`, async ({ page }) => {
      await managingAppsApi.stubGetPrisonerApps()
      await managingAppsApi.stubGetGroupsAndTypes()
      await loginWithPrisonerAuth(page)

      await navigateToAppDetails(page, appType.name)

      await expect(page.locator('.govuk-caption-xl')).toHaveText(appType.name)
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Back' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Cancel' })).toBeVisible()
    })
  })
})
