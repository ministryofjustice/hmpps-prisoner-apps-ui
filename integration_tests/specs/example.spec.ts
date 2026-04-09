import { expect, test } from '@playwright/test'
import exampleApi from '../mockApis/exampleApi'

import { loginWithPrisonerAuth, resetStubs } from '../testUtils'

test.describe('Example', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('ExampleApi failure shows error page', async ({ page }) => {
    await exampleApi.stubExampleTime(500)

    await loginWithPrisonerAuth(page)

    await expect(page.locator('h1', { hasText: 'Apps' })).toBeVisible()
  })
})
