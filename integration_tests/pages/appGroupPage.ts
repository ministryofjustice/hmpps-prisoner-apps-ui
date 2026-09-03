import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppGroupPage extends AbstractPage {
  readonly pageHeading: Locator

  readonly pinPhoneContactAppsButton: Locator

  readonly cancelLink: Locator

  readonly errorHeading: Locator

  readonly groupHeading: Locator

  constructor(page: Page) {
    super(page)
    this.pageHeading = page.getByRole('heading', { name: 'Select app group', level: 1 })
    this.pinPhoneContactAppsButton = page.getByRole('button', { name: 'Pin Phone Contact Apps', exact: false })
    this.cancelLink = page.getByRole('link', { name: 'Cancel' })
    this.errorHeading = page.locator('h1', { hasText: 'Internal Server Error' })
    this.groupHeading = page.getByRole('heading', { name: 'Pin Phone Contact Apps', level: 3 })
  }

  async open() {
    await this.page.goto('/log/group')
  }

  async selectPinPhoneContactApps() {
    await this.pinPhoneContactAppsButton.click()
  }

  async expectVisible() {
    await expect(this.pageHeading).toBeVisible()
    await expect(this.groupHeading).toBeVisible()
  }
}
