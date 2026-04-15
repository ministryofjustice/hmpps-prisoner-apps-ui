import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ApplicationListPage extends AbstractPage {
  readonly usersName: Locator

  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.usersName = page.getByTestId('launchpad-home-header-user-name')
    this.header = page.getByRole('heading', { name: 'Apps', level: 1 })
  }

  static async verifyOnPage(page: Page): Promise<ApplicationListPage> {
    const applicationListPage = new ApplicationListPage(page)
    await expect(applicationListPage.usersName).toBeVisible()
    await expect(applicationListPage.header).toBeVisible()
    return applicationListPage
  }
}
