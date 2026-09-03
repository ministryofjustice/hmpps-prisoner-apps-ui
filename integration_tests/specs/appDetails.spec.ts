import { expect, test, type Page } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import personalRelationshipsApi from '../mockApis/personalRelationshipsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import { groups } from '../../server/testData/groups/groups'
import AppGroupPage from '../pages/appGroupPage'
import AppTypePage from '../pages/appTypePage'
import AppDetailsPage from '../pages/appDetailsPage'

const stubDependencies = async () => {
  await managingAppsApi.stubGetPrisonerApps()
  await managingAppsApi.stubGetGroupsAndTypes()
  await Promise.all(
    groups.flatMap(group => group.appTypes).map(appType => managingAppsApi.stubGetPendingAppType(appType.id, 0)),
  )
  await Promise.all(personalRelationshipsApi.stubGetRelationships())
}

const navigateToAppDetails = async (page: Page, appTypeName: string) => {
  const appGroupPage = new AppGroupPage(page)
  const appTypePage = new AppTypePage(page)
  await appGroupPage.open()
  await appGroupPage.selectPinPhoneContactApps()
  await expect(page).toHaveURL('/log/type')

  await appTypePage.selectAppType(appTypeName)
  await appTypePage.continue()
  await expect(page).toHaveURL('/log/application-details')
}

const fillLogDetailsForAppType = async (page: Page, appTypeId: number) => {
  const appDetailsPage = new AppDetailsPage(page)
  switch (appTypeId) {
    case 1:
      await appDetailsPage.fillAmount('10')
      await appDetailsPage.fillReason('Test reason for emergency credit')
      break
    case 2:
      await appDetailsPage.fillContactDetails({
        firstName: 'John',
        lastName: 'Smith',
        organisation: 'NHS',
        relation: 'Friend',
        telephone: '07911123456',
      })
      break
    case 3:
      await appDetailsPage.fillContactDetails({
        firstName: 'Jane',
        lastName: 'Doe',
        relation: 'Friend',
        telephone: '07911123457',
        ageUnknown: true,
      })
      break
    case 4:
      await appDetailsPage.fillContactDetails({
        firstName: 'Mark',
        lastName: 'Taylor',
        telephone: '07911123458',
      })
      break
    case 5:
      await appDetailsPage.fillDetails('Swap visiting orders details')
      break
    case 6:
      await appDetailsPage.fillDetails('Supply list of contacts details')
      break
    case 7:
      await appDetailsPage.fillDetails('General enquiry details')
      break
    default:
      throw new Error(`Unsupported app type id: ${appTypeId}`)
  }
}

test.describe('App details', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('shows app details page with app type name and Add details heading', async ({ page }) => {
    const appDetailsPage = new AppDetailsPage(page)
    await stubDependencies()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)

    await appDetailsPage.expectForAppType(appType.name)
  })

  test('back link redirects to app type page', async ({ page }) => {
    const appDetailsPage = new AppDetailsPage(page)
    await stubDependencies()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)
    await appDetailsPage.backLink.click()

    await expect(page).toHaveURL('/log/type')
  })

  test('cancel link redirects to landing page', async ({ page }) => {
    const appDetailsPage = new AppDetailsPage(page)
    await stubDependencies()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)
    await appDetailsPage.cancelLink.click()

    await expect(page).toHaveURL('/')
  })

  groups[0].appTypes.forEach(appType => {
    test(`app details page shows form for "${appType.name}"`, async ({ page }) => {
      const appDetailsPage = new AppDetailsPage(page)
      await stubDependencies()
      await loginWithPrisonerAuth(page)

      await navigateToAppDetails(page, appType.name)

      await appDetailsPage.expectForAppType(appType.name)
    })
  })

  groups[0].appTypes.forEach(appType => {
    test(`submitting log details for "${appType.name}" goes to check details`, async ({ page }) => {
      await stubDependencies()
      await loginWithPrisonerAuth(page)

      await navigateToAppDetails(page, appType.name)
      await fillLogDetailsForAppType(page, appType.id)
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(page).toHaveURL('/log/confirm')
      await expect(page.getByRole('heading', { name: 'Check details', level: 1 })).toBeVisible()
      const appTypeRow = page
        .locator('.govuk-summary-list__row')
        .filter({ has: page.locator('.govuk-summary-list__key', { hasText: 'App type' }) })
      await expect(appTypeRow.locator('.govuk-summary-list__value')).toHaveText(appType.name)
    })
  })
})
