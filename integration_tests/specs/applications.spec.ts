import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import ApplicationListPage from '../pages/applicationListPage'

test.describe('Applications', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('landing page is visible after login', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page)

    await expect(page.getByRole('heading', { name: 'Manage apps', level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Send an app' })).toHaveAttribute('href', '/log/group')
    await expect(page.getByRole('link', { name: 'Your apps' })).toHaveAttribute('href', '/applications')
  })

  test('applications page is visible from landing page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page)

    await page.getByRole('link', { name: 'Your apps' }).click()
    await ApplicationListPage.verifyOnPage(page)
  })

  test('Managing apps API failure shows error page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps(500)

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    await expect(page.locator('h1', { hasText: 'Internal Server Error' })).toBeVisible()
  })

  test('shows prisoner applications on the apps page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    await expect(page.getByRole('heading', { name: "A's apps", level: 1 })).toBeVisible()
    await expect(page.getByText('Check on apps already sent.')).toBeVisible()

    const resultsTable = page.locator('[data-qa="app-results-table"]')
    await expect(resultsTable).toBeVisible()

    await expect(resultsTable.getByRole('columnheader', { name: 'Date sent' })).toBeVisible()
    await expect(resultsTable.getByRole('columnheader', { name: 'App' })).toBeVisible()
    await expect(resultsTable.getByRole('columnheader', { name: 'Status' })).toBeVisible()

    const firstRow = resultsTable.locator('tbody tr').first()
    await expect(firstRow).toContainText('10/01/2024')
    await expect(firstRow).toContainText('Add an official PIN phone contact')
    await expect(firstRow).toContainText('Pending')

    const firstViewLink = resultsTable.getByRole('link', { name: 'View' }).first()
    await expect(firstViewLink).toBeVisible()
    await expect(firstViewLink).toHaveAttribute('href', /\/applications\/.+/)
  })
})
