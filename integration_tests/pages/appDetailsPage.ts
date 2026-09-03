import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppDetailsPage extends AbstractPage {
  readonly caption: Locator

  readonly pageHeading: Locator

  readonly continueButton: Locator

  readonly backLink: Locator

  readonly cancelLink: Locator

  constructor(page: Page) {
    super(page)
    this.caption = page.locator('.govuk-caption-xl')
    this.pageHeading = page.getByRole('heading', { name: 'Add details', level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.backLink = page.getByRole('link', { name: 'Back' })
    this.cancelLink = page.getByRole('link', { name: 'Cancel' })
  }

  async expectForAppType(appTypeName: string) {
    await expect(this.caption).toHaveText(appTypeName)
    await expect(this.pageHeading).toBeVisible()
    await expect(this.continueButton).toBeVisible()
    await expect(this.backLink).toBeVisible()
    await expect(this.cancelLink).toBeVisible()
  }

  async fillAmount(amount: string) {
    await this.page.fill('input[name="amount"]', amount)
  }

  async fillReason(reason: string) {
    await this.page.fill('textarea[name="reason"]', reason)
  }

  async fillContactDetails({
    firstName,
    lastName,
    organisation,
    relation,
    telephone,
    ageUnknown,
  }: {
    firstName?: string
    lastName?: string
    organisation?: string
    relation?: string
    telephone?: string
    ageUnknown?: boolean
  }) {
    if (firstName) await this.page.fill('input[name="firstName"]', firstName)
    if (lastName) await this.page.fill('input[name="lastName"]', lastName)
    if (organisation) await this.page.fill('input[name="organisation"]', organisation)
    if (relation) await this.page.selectOption('select[name="relationship"]', { label: relation })
    if (telephone) await this.page.fill('input[name="telephone1"]', telephone)
    if (ageUnknown) await this.page.getByLabel('I do not know their age or date of birth').check()
  }

  async fillDetails(details: string) {
    await this.page.fill('textarea[name="details"]', details)
  }

  async continue() {
    await this.continueButton.click()
  }
}
