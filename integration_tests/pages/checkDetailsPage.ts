import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class CheckDetailsPage extends AbstractPage {
  readonly continueButton: Locator

  readonly changeLinks: Locator

  constructor(page: Page) {
    super(page)
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.changeLinks = page.getByRole('link', { name: /Change/ })
  }

  async continue() {
    await this.continueButton.click()
  }

  async changeDetails() {
    await this.changeLinks.first().click()
  }

  async expectDetailsVisible(details: string) {
    await expect(this.page.getByText(details)).toBeVisible()
  }
}
