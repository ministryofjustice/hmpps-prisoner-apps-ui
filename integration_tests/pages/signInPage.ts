import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class SignInPage extends AbstractPage {
  readonly signInHeading: Locator

  readonly authorisationErrorHeading: Locator

  constructor(page: Page) {
    super(page)
    this.signInHeading = page.getByRole('heading', { name: 'Sign in', level: 1 })
    this.authorisationErrorHeading = page.getByRole('heading', { name: 'Authorisation Error', level: 1 })
  }

  async expectSignInPage() {
    await expect(this.signInHeading).toBeVisible()
  }

  async expectAuthorisationError() {
    await expect(this.authorisationErrorHeading).toBeVisible()
  }
}
