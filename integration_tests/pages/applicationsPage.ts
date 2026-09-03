import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ApplicationsPage extends AbstractPage {
  readonly pageHeading: Locator

  readonly sendAnAppLink: Locator

  readonly yourAppsLink: Locator

  readonly resultsTable: Locator

  constructor(page: Page) {
    super(page)
    this.pageHeading = page.getByRole('heading', { name: 'Manage apps', level: 1 })
    this.sendAnAppLink = page.getByRole('link', { name: 'Send an app' })
    this.yourAppsLink = page.getByRole('link', { name: 'Your apps' })
    this.resultsTable = page.locator('[data-qa="app-results-table"]')
  }

  static async verifyOnPage(page: Page): Promise<ApplicationsPage> {
    const applicationsPage = new ApplicationsPage(page)
    await expect(applicationsPage.pageHeading).toBeVisible()
    await expect(applicationsPage.sendAnAppLink).toHaveAttribute('href', '/log/group')
    await expect(applicationsPage.yourAppsLink).toHaveAttribute('href', '/applications')
    return applicationsPage
  }

  async openYourApps() {
    await this.yourAppsLink.click()
  }

  async expectResultsTableVisible() {
    await expect(this.resultsTable).toBeVisible()
  }
}
