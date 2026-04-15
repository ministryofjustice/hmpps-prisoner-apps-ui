import { expect, test } from '@playwright/test'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import prisonerAuth from '../mockApis/prisonerAuth'

import ApplicationListPage from '../pages/applicationListPage'
import managingAppsApi from '../mockApis/managingAppsApi'

test.describe('SignIn', () => {
  test.use({
    baseURL: 'http://localhost:3007',
  })
  test.beforeEach(async () => {})

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await prisonerAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await prisonerAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in')
  })

  test('User name visible in header', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page, { name: 'A TestUser' })

    const applicationListPage = await ApplicationListPage.verifyOnPage(page)

    await expect(applicationListPage.usersName).toHaveText('A TestUser')
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await loginWithPrisonerAuth(page, { tokenExpiresInSeconds: -1 })

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Authorisation Error')
  })

  test('Token verification failure clears user session', async ({ page }) => {
    await loginWithPrisonerAuth(page, { name: 'A TestUser', tokenExpiresInSeconds: -1 })

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Authorisation Error')

    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page, { name: 'Some OtherTestUser', active: true })

    const applicationListPage = await ApplicationListPage.verifyOnPage(page)
    await expect(applicationListPage.usersName).toHaveText('Some OtherTestUser')
  })
})
