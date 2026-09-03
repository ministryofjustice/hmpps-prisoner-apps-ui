import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import AppGroupPage from '../pages/appGroupPage'
import AppTypePage from '../pages/appTypePage'
import AppDetailsPage from '../pages/appDetailsPage'
import AppSubmissionPage from '../pages/appSubmissionPage'

test.describe('App submission', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('submits one app type and shows confirmation page content', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const appTypePage = new AppTypePage(page)
    const appDetailsPage = new AppDetailsPage(page)
    const appSubmissionPage = new AppSubmissionPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await managingAppsApi.stubGetPendingAppType(1, 0)
    await managingAppsApi.stubSubmitApp()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.selectPinPhoneContactApps()
    await expect(page).toHaveURL('/log/type')

    await appTypePage.selectAppType('Add emergency phone credit')
    await appTypePage.continue()
    await expect(page).toHaveURL('/log/application-details')

    await appDetailsPage.fillAmount('10')
    await appDetailsPage.fillReason('Emergency credit needed for family call')
    await appDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirm')

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/log/confirmation')

    await appSubmissionPage.expectSuccess('Add emergency phone credit')
  })

  test('allows changing details from check details page before submit', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const appTypePage = new AppTypePage(page)
    const appDetailsPage = new AppDetailsPage(page)
    const appSubmissionPage = new AppSubmissionPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes()
    await managingAppsApi.stubGetPendingAppType(7, 0)
    await managingAppsApi.stubSubmitApp()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.selectPinPhoneContactApps()
    await expect(page).toHaveURL('/log/type')

    await appTypePage.selectAppType('Make a general PIN phone enquiry')
    await appTypePage.continue()
    await expect(page).toHaveURL('/log/application-details')

    await appDetailsPage.fillDetails('Initial enquiry details')
    await appDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirm')
    await expect(page.getByText('Initial enquiry details')).toBeVisible()

    await page
      .getByRole('link', { name: /Change/ })
      .first()
      .click()
    await expect(page).toHaveURL('/log/application-details')

    await appDetailsPage.fillDetails('Updated enquiry details after change')
    await appDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirm')
    await expect(page.getByText('Updated enquiry details after change')).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/log/confirmation')
    await expect(page.getByText('You have sent your app')).toBeVisible()
    await appSubmissionPage.expectSuccess('Make a general PIN phone enquiry')
  })
})
