import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppSubmissionPage extends AbstractPage {
  readonly confirmationHeading: Locator

  readonly appName: Locator

  readonly sendNewAppLink: Locator

  readonly thisAppLink: Locator

  readonly allAppsLink: Locator

  constructor(page: Page) {
    super(page)
    this.confirmationHeading = page.getByText('You have sent your app')
    this.appName = page.getByText('Add emergency phone credit')
    this.sendNewAppLink = page.getByRole('link', { name: 'send a new app' })
    this.thisAppLink = page.getByRole('link', { name: 'this app' })
    this.allAppsLink = page.getByRole('link', { name: 'all your apps' })
  }

  async expectSuccess(appNameText: string) {
    await expect(this.confirmationHeading).toBeVisible()
    await expect(this.page.getByText(appNameText)).toBeVisible()
    await expect(this.page.getByText('You have sent a new app to staff.')).toBeVisible()
    await expect(this.page.getByText('Staff will process it as soon as possible.')).toBeVisible()
    await expect(this.sendNewAppLink).toHaveAttribute('href', '/log/group')
    await expect(this.thisAppLink).toHaveAttribute('href', '/applications/app-123')
    await expect(this.allAppsLink).toHaveAttribute('href', '/applications')
  }
}
