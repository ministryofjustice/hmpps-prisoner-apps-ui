import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import AppGroupPage from '../pages/appGroupPage'
import ApplicationsPage from '../pages/applicationsPage'

test.describe('App group', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows app groups on the page', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.expectVisible()
  })

  test('redirects to app type page when a group is selected', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.selectPinPhoneContactApps()

    await expect(page).toHaveURL('/log/type')
  })

  test('cancel link returns user to landing page', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const applicationsPage = new ApplicationsPage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.cancelLink.click()

    await expect(page).toHaveURL('/')
    await applicationsPage.pageHeading.waitFor()
  })

  test('shows error page when groups API fails', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes(500)
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()

    await expect(appGroupPage.errorHeading).toBeVisible()
  })
})
