import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppTypePage extends AbstractPage {
  readonly pageHeading: Locator

  readonly continueButton: Locator

  readonly cancelLink: Locator

  readonly validationErrorLink: Locator

  readonly typeError: Locator

  constructor(page: Page) {
    super(page)
    this.pageHeading = page.getByRole('heading', { name: 'Select app type', level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.cancelLink = page.getByRole('link', { name: 'Cancel' })
    this.validationErrorLink = page.getByRole('link', { name: 'Choose an app type' })
    this.typeError = page.locator('#type-error')
  }

  appTypeOption(appTypeName: string) {
    return this.page.getByLabel(appTypeName)
  }

  async selectAppType(appTypeName: string) {
    await this.appTypeOption(appTypeName).check()
  }

  async continue() {
    await this.continueButton.click()
  }

  async expectValidationError() {
    await expect(this.validationErrorLink).toBeVisible()
    await expect(this.typeError).toContainText('Choose an app type')
  }
}
