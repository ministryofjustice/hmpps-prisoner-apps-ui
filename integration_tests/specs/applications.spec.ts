import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import buildApplicationsStatusFixtures from '../testData/applicationsFixtures'
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
    await expect(page.getByText('Apps you have already sent')).toBeVisible()

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
    const { openApps, closedApps } = buildApplicationsStatusFixtures()

    await managingAppsApi.stubGetPrisonerApps(200, openApps, closedApps)

    await loginWithPrisonerAuth(page)
    await page.goto('/applications')

    const applicationListPage = await ApplicationListPage.verifyOnPage(page)
    await applicationListPage.expectTabsVisible()
    await applicationListPage.expectOpenTabSelected()
    await applicationListPage.expectOpenStatusesVisible(['New', 'In progress'])

    await applicationListPage.openClosedTab()
    await applicationListPage.expectClosedTabSelected()
    await applicationListPage.expectClosedResultsHeaderVisible()
    await applicationListPage.expectClosedStatusesVisible(['Approved', 'Rejected', 'Declined'])
  })
})
