import { expect, test, type Page } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import { groups } from '../../server/testData/groups/groups'

const selectPinPhoneAppGroup = async (page: Page) => {
  await page.goto('/log/group')
  await page.getByLabel('Pin Phone Contact Apps').check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL('/log/type')
}

test.describe('App type', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows app types for selected group', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await selectPinPhoneAppGroup(page)

    await expect(page.getByRole('heading', { name: 'Select app type', level: 1 })).toBeVisible()
    await expect(page.getByLabel(groups[0].appTypes[0].name)).toBeVisible()
  })

  groups[0].appTypes.forEach(appType => {
    test(`selecting "${appType.name}" goes to log details page`, async ({ page }) => {
      await managingAppsApi.stubGetPrisonerApps()
      await managingAppsApi.stubGetGroupsAndTypes()
      await loginWithPrisonerAuth(page)

      await selectPinPhoneAppGroup(page)
      await page.getByLabel(appType.name).check()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(page).toHaveURL('/log/application-details')
      await expect(page.locator('.govuk-caption-xl')).toHaveText(appType.name)
      await expect(page.getByRole('heading', { name: 'Add details', level: 1 })).toBeVisible()
    })
  })
})
