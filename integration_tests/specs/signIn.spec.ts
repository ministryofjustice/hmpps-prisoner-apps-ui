import { expect, test } from '@playwright/test'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import prisonerAuth from '../mockApis/prisonerAuth'
import managingAppsApi from '../mockApis/managingAppsApi'
import SignInPage from '../pages/signInPage'

test.describe('SignIn', () => {
  test.use({
    baseURL: 'http://localhost:3007',
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    const signInPage = new SignInPage(page)
    await prisonerAuth.stubSignInPage()
    await page.goto('/')

    await signInPage.expectSignInPage()
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    const signInPage = new SignInPage(page)
    await prisonerAuth.stubSignInPage()
    await page.goto('/sign-in')

    await signInPage.expectSignInPage()
  })

  test('User name visible in header', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page, { name: 'A TestUser' })

    await expect(page.getByTestId('launchpad-home-header-user-name')).toHaveText('A TestUser')
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    const signInPage = new SignInPage(page)
    await loginWithPrisonerAuth(page, { tokenExpiresInSeconds: -1 })

    await signInPage.expectAuthorisationError()
  })

  test('Token verification failure clears user session', async ({ page }) => {
    const signInPage = new SignInPage(page)
    await loginWithPrisonerAuth(page, { name: 'A TestUser', tokenExpiresInSeconds: -1 })

    await signInPage.expectAuthorisationError()

    await managingAppsApi.stubGetPrisonerApps()
    await loginWithPrisonerAuth(page, { name: 'Some OtherTestUser', active: true })

    await expect(page.getByTestId('launchpad-home-header-user-name')).toHaveText('Some OtherTestUser')
  })
})
