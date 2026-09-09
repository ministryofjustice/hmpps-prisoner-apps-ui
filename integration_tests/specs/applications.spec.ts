import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import ApplicationListPage from '../pages/applicationListPage'
import ApplicationsPage from '../pages/applicationsPage'

test.describe('Applications', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('landing page is visible after login', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page)

    await ApplicationsPage.verifyOnPage(page)
  })

  test('applications page is visible from landing page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page)

    const applicationsPage = new ApplicationsPage(page)
    await applicationsPage.openYourApps()
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
    await expect(page.getByText('Apps you have already sent.')).toBeVisible()

    const resultsTable = page.locator('[data-qa="app-results-table"]')
    await expect(resultsTable).toBeVisible()

    await expect(resultsTable.getByRole('columnheader', { name: 'Date sent' })).toBeVisible()
    await expect(resultsTable.getByRole('columnheader', { name: 'App' })).toBeVisible()
    await expect(resultsTable.getByRole('columnheader', { name: 'Status' })).toBeVisible()

    const firstRow = resultsTable.locator('tbody tr').first()
    await expect(firstRow).toContainText('10 January 2024')
    await expect(firstRow).toContainText('Add an official PIN phone contact')
    await expect(firstRow).toContainText('New')

    const firstViewLink = resultsTable.getByRole('link', { name: 'Add an official PIN phone contact' }).first()
    await expect(firstViewLink).toBeVisible()
    await expect(firstViewLink).toHaveAttribute('href', /\/applications\/.+/)
  })

  test('shows Open and Closed tabs and switches between them', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    const openTab = page.getByRole('tab', { name: 'Open apps' })
    const closedTab = page.getByRole('tab', { name: 'Closed apps' })
    await expect(openTab).toBeVisible()
    await expect(closedTab).toBeVisible()
    await expect(openTab).toHaveAttribute('aria-selected', 'true')

    const openTable = page.locator('[data-qa="app-results-table"]')
    await expect(openTable.getByRole('cell', { name: 'New' })).toBeVisible()

    await closedTab.click()
    await expect(page).toHaveURL(/#closed/)
    await expect(closedTab).toHaveAttribute('aria-selected', 'true')

    const closedTable = page.locator('[data-qa="app-results-table-closed"]')
    await expect(closedTable.getByRole('columnheader', { name: 'Last updated' })).toBeVisible()
    await expect(closedTable.getByRole('cell', { name: 'Approved' })).toBeVisible()
  })
})
