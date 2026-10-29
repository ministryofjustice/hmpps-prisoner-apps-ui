import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import AppGroupPage from '../pages/appGroupPage'
import AppTypePage from '../pages/appTypePage'
import AppDetailsPage from '../pages/appDetailsPage'
import AppSubmissionPage from '../pages/appSubmissionPage'
import CheckDetailsPage from '../pages/checkDetailsPage'
import {
  genericApplicationScenarios,
  gymAppTypes,
  gymBookingAppType,
  gymGroups,
} from '../testData/appSubmissionFixtures'

test.describe('App submission', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('submits one app type and shows confirmation page content', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const appTypePage = new AppTypePage(page)
    const appDetailsPage = new AppDetailsPage(page)
    const checkDetailsPage = new CheckDetailsPage(page)
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

    await checkDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirmation')

    await appSubmissionPage.expectSuccess('Add emergency phone credit')
  })

  test('allows changing details from check details page before submit', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const appTypePage = new AppTypePage(page)
    const appDetailsPage = new AppDetailsPage(page)
    const checkDetailsPage = new CheckDetailsPage(page)
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
    await checkDetailsPage.expectDetailsVisible('Initial enquiry details')

    await checkDetailsPage.changeDetails()
    await expect(page).toHaveURL('/log/application-details')

    await appDetailsPage.fillDetails('Updated enquiry details after change')
    await appDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirm')
    await checkDetailsPage.expectDetailsVisible('Updated enquiry details after change')

    await checkDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirmation')
    await appSubmissionPage.expectSuccess('Make a general PIN phone enquiry')
  })

  test('submits a new gym app and shows confirmation page content', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const appTypePage = new AppTypePage(page)
    const appDetailsPage = new AppDetailsPage(page)
    const checkDetailsPage = new CheckDetailsPage(page)
    const appSubmissionPage = new AppSubmissionPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes(200, gymGroups)
    await managingAppsApi.stubGetPendingAppType(gymBookingAppType.id, 0)
    await managingAppsApi.stubSubmitApp()
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.selectAppGroup('Gym')
    await expect(page).toHaveURL('/log/type')

    await appTypePage.selectAppType(gymBookingAppType.name)
    await appTypePage.continue()
    await expect(page).toHaveURL('/log/application-details')

    await appDetailsPage.fillDetails('Please add me to the next available gym induction session.')
    await appDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirm')

    await checkDetailsPage.continue()
    await expect(page).toHaveURL('/log/confirmation')

    await appSubmissionPage.expectSuccess(gymBookingAppType.name)
  })

  genericApplicationScenarios.forEach(({ groupName, groups, appType, appTypes, details }) => {
    test(`submits ${appType.name} from ${groupName}`, async ({ page }) => {
      const appGroupPage = new AppGroupPage(page)
      const appTypePage = new AppTypePage(page)
      const appDetailsPage = new AppDetailsPage(page)
      const checkDetailsPage = new CheckDetailsPage(page)
      const appSubmissionPage = new AppSubmissionPage(page)

      await managingAppsApi.stubGetPrisonerApps()
      await managingAppsApi.stubGetGroupsAndTypes(200, groups)
      await managingAppsApi.stubGetPendingAppType(appType.id, 0)
      await managingAppsApi.stubSubmitApp()
      await loginWithPrisonerAuth(page)

      await appGroupPage.open()
      await appGroupPage.selectAppGroup(groupName)
      await expect(page).toHaveURL('/log/type')
      await appTypePage.expectAppTypesVisible(appTypes.map(type => type.name))

      await appTypePage.selectAppType(appType.name)
      await appTypePage.continue()
      await expect(page).toHaveURL('/log/application-details')

      await appDetailsPage.fillDetails(details)
      await appDetailsPage.continue()
      await expect(page).toHaveURL('/log/confirm')

      await checkDetailsPage.continue()
      await expect(page).toHaveURL('/log/confirmation')

      await appSubmissionPage.expectSuccess(appType.name)
    })
  })

  test('shows all gym app types when the gym group is selected', async ({ page }) => {
    const appGroupPage = new AppGroupPage(page)
    const appTypePage = new AppTypePage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetGroupsAndTypes(200, gymGroups)
    await loginWithPrisonerAuth(page)

    await appGroupPage.open()
    await appGroupPage.selectAppGroup('Gym')
    await expect(page).toHaveURL('/log/type')

    await appTypePage.expectAppTypesVisible(gymAppTypes.map(appType => appType.name))
  })
})
