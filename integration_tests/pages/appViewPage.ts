import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppViewPage extends AbstractPage {
  readonly resultsTable: Locator

  readonly appHeading: Locator

  readonly statusMessage: Locator

  readonly replyHeading: Locator

  readonly sendButton: Locator

  readonly replyInput: Locator

  readonly validationMessage: Locator

  readonly backToAppsHomeButton: Locator

  constructor(page: Page) {
    super(page)
    this.resultsTable = page.locator('[data-qa="app-results-table"]')
    this.appHeading = page.getByRole('heading', { name: 'Make a general PIN phone enquiry', level: 1 })
    this.statusMessage = page.getByText('You have sent this app and staff will process it as soon as possible.')
    this.replyHeading = page.getByRole('heading', { name: 'Send a reply' })
    this.sendButton = page.getByRole('button', { name: 'Send' })
    this.replyInput = page.locator('#reply')
    this.validationMessage = page.getByText('There is a problem')
    this.backToAppsHomeButton = page.getByRole('button', { name: 'Back to apps home' })
  }

  async expectSubmittedAppVisible() {
    await expect(this.appHeading).toBeVisible()
    await expect(this.statusMessage).toBeVisible()
    await expect(this.backToAppsHomeButton).toBeVisible()
  }

  async expectReplyFormVisible() {
    await expect(this.replyHeading).toBeVisible()
    await expect(this.sendButton).toBeVisible()
  }

  async fillReply(text: string) {
    await this.replyInput.fill(text)
  }

  async submitReply() {
    await this.sendButton.click()
  }

  async expectValidationSummary() {
    await expect(this.validationMessage).toBeVisible()
    await expect(this.page.getByRole('link', { name: 'Add a message' })).toBeVisible()
  }
}
