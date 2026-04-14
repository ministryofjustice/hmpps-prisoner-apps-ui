import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly usersName: Locator

  private constructor(page: Page) {
    super(page)
    this.usersName = page.getByTestId('launchpad-home-header-user-name')
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await expect(homePage.usersName).toBeVisible()
    return homePage
  }
}
