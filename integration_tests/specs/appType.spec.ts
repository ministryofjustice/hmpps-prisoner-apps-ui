import { expect, test, type Page } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import { groups } from '../../server/testData/groups/groups'
import AppGroupPage from '../pages/appGroupPage'
import AppTypePage from '../pages/appTypePage'
import AppDetailsPage from '../pages/appDetailsPage'

const selectPinPhoneAppGroup = async (page: Page) => {
  const appGroupPage = new AppGroupPage(page)
  await appGroupPage.open()
  await appGroupPage.selectPinPhoneContactApps()
  await expect(page).toHaveURL('/log/type')
}

test.describe('App type', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows app types for selected group', async ({ page }) => {
    const appTypePage = new AppTypePage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await selectPinPhoneAppGroup(page)

    await expect(appTypePage.pageHeading).toBeVisible()
    await expect(appTypePage.appTypeOption(groups[0].appTypes[0].name)).toBeVisible()
  })

  test('shows validation error when no type is selected', async ({ page }) => {
    const appTypePage = new AppTypePage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await selectPinPhoneAppGroup(page)
    await appTypePage.continue()

    await appTypePage.expectValidationError()
  })

  test('cancel link returns user to landing page', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.cancelLink.click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Manage apps', level: 1 })).toBeVisible()
  })

  groups[0].appTypes.forEach(appType => {
    test(`selecting "${appType.name}" goes to log details page`, async ({ page }) => {
      const appTypePage = new AppTypePage(page)
      const appDetailsPage = new AppDetailsPage(page)
      await managingAppsApi.stubGetPrisonerApps()
      await managingAppsApi.stubGetGroupsAndTypes()
      await managingAppsApi.stubGetPendingAppType(appType.id, 0)
      await loginWithPrisonerAuth(page)

      await selectPinPhoneAppGroup(page)
      await appTypePage.selectAppType(appType.name)
      await appTypePage.continue()

      await expect(page).toHaveURL('/log/application-details')
      await appDetailsPage.expectForAppType(appType.name)
    })
  })

  test('shows app limit message when pending count is 1', async ({ page }) => {
    const appType = groups[0].appTypes[0]
    const appTypePage = new AppTypePage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await managingAppsApi.stubGetPendingAppType(appType.id, 1)
    await loginWithPrisonerAuth(page)

    await selectPinPhoneAppGroup(page)
    await appTypePage.selectAppType(appType.name)
    await appTypePage.continue()

    await expect(page.getByText('You already have one of those apps open.')).toBeVisible()
  })
})
