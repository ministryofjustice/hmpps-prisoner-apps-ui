import { expect, test, type Page } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import personalRelationshipsApi from '../mockApis/personalRelationshipsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import { groups } from '../../server/testData/groups/groups'

const stubDependencies = async () => {
  await managingAppsApi.stubGetPrisonerApps()
  await managingAppsApi.stubGetGroupsAndTypes()
  await Promise.all(personalRelationshipsApi.stubGetRelationships())
}

const navigateToAppDetails = async (page: Page, appTypeName: string) => {
  await page.goto('/log/group')
  await page.getByLabel('Pin Phone Contact Apps').check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL('/log/type')

  await page.getByLabel(appTypeName).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL('/log/application-details')
}

const fillLogDetailsForAppType = async (page: Page, appTypeId: number) => {
  switch (appTypeId) {
    case 1:
      await page.fill('input[name="amount"]', '10')
      await page.fill('textarea[name="reason"]', 'Test reason for emergency credit')
      break
    case 2: {
      await page.fill('input[name="firstName"]', 'John')
      await page.fill('input[name="lastName"]', 'Smith')
      await page.fill('input[name="organisation"]', 'NHS')
      await page.selectOption('select[name="relationship"]', { label: 'Friend' })
      await page.fill('input[name="telephone1"]', '07911123456')
      break
    }
    case 3:
      await page.fill('input[name="firstName"]', 'Jane')
      await page.fill('input[name="lastName"]', 'Doe')
      await page.getByLabel('I do not know their age or date of birth').check()
      await page.selectOption('select[name="relationship"]', { label: 'Friend' })
      await page.fill('input[name="telephone1"]', '07911123457')
      break
    case 4:
      await page.fill('input[name="firstName"]', 'Mark')
      await page.fill('input[name="lastName"]', 'Taylor')
      await page.fill('input[name="telephone1"]', '07911123458')
      break
    case 5:
      await page.fill('textarea[name="details"]', 'Swap visiting orders details')
      break
    case 6:
      await page.fill('textarea[name="details"]', 'Supply list of contacts details')
      break
    case 7:
      await page.fill('textarea[name="details"]', 'General enquiry details')
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
    await stubDependencies()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)

    await expect(page.locator('.govuk-caption-xl')).toHaveText(appType.name)
    await expect(page.getByRole('heading', { name: 'Add details', level: 1 })).toBeVisible()
  })

  test('back link redirects to app type page', async ({ page }) => {
    await stubDependencies()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)
    await page.getByRole('link', { name: 'Back' }).click()

    await expect(page).toHaveURL('/log/type')
  })

  test('cancel link redirects to application list page', async ({ page }) => {
    await stubDependencies()
    await loginWithPrisonerAuth(page)

    const appType = groups[0].appTypes[0]

    await navigateToAppDetails(page, appType.name)
    await page.getByRole('link', { name: 'Cancel' }).click()

    await expect(page).toHaveURL('/applications')
  })

  groups[0].appTypes.forEach(appType => {
    test(`app details page shows form for "${appType.name}"`, async ({ page }) => {
      await stubDependencies()
      await loginWithPrisonerAuth(page)

      await navigateToAppDetails(page, appType.name)

      await expect(page.locator('.govuk-caption-xl')).toHaveText(appType.name)
      await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Back' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Cancel' })).toBeVisible()
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
