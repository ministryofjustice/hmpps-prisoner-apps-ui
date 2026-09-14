import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ApplicationListPage extends AbstractPage {
  readonly usersName: Locator

  readonly header: Locator

  readonly openTab: Locator

  readonly closedTab: Locator

  readonly openResultsTable: Locator

  readonly closedResultsTable: Locator

  private constructor(page: Page) {
    super(page)
    this.usersName = page.getByTestId('launchpad-home-header-user-name')
    this.header = page.getByRole('heading', { name: "A's apps", level: 1 })
    this.openTab = page.getByRole('tab', { name: 'Open apps' })
    this.closedTab = page.getByRole('tab', { name: 'Closed apps' })
    this.openResultsTable = page.locator('[data-qa="app-results-table"]')
    this.closedResultsTable = page.locator('[data-qa="app-results-table-closed"]')
  }

  static async verifyOnPage(page: Page): Promise<ApplicationListPage> {
    const applicationListPage = new ApplicationListPage(page)
    await expect(applicationListPage.usersName).toBeVisible()
    await expect(applicationListPage.header).toBeVisible()
    return applicationListPage
  }

  async expectTabsVisible() {
    await expect(this.openTab).toBeVisible()
    await expect(this.closedTab).toBeVisible()
  }

  async expectOpenTabSelected() {
    await expect(this.openTab).toHaveAttribute('aria-selected', 'true')
  }

  async expectOpenStatusesVisible(statuses: string[]) {
    await Promise.all(
      statuses.map(status => expect(this.openResultsTable.getByRole('cell', { name: status }).first()).toBeVisible()),
    )
  }

  async openClosedTab() {
    await this.closedTab.click()
    await expect(this.page).toHaveURL(/#closed/)
  }

  async expectClosedTabSelected() {
    await expect(this.closedTab).toHaveAttribute('aria-selected', 'true')
  }

  async expectClosedResultsHeaderVisible() {
    await expect(this.closedResultsTable.getByRole('columnheader', { name: 'Last updated' })).toBeVisible()
  }

  async expectClosedStatusesVisible(statuses: string[]) {
    await Promise.all(
      statuses.map(status => expect(this.closedResultsTable.getByRole('cell', { name: status }).first()).toBeVisible()),
    )
  }
}
