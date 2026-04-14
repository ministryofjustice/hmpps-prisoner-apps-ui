import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ExamplePage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Apps', level: 1 })
  }

  static async verifyOnPage(page: Page): Promise<ExamplePage> {
    const examplePage = new ExamplePage(page)
    await expect(examplePage.header).toBeVisible()
    return examplePage
  }
}
