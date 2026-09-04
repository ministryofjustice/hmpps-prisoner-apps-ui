import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { getMatchingRequests } from '../mockApis/wiremock'
import { prisonerSentMessage, staffReplyMessage } from '../../server/testData/applications/messages'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import AppViewPage from '../pages/appViewPage'

test.describe('App view', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('clicking View from app list opens submitted app page', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1')
    await loginWithPrisonerAuth(page)

    await page.goto('/applications')
    await expect(appViewPage.resultsTable).toBeVisible()

    await page.getByRole('link', { name: 'View' }).first().click()

    await expect(page).toHaveURL('/applications/1')
    await appViewPage.expectSubmittedAppVisible()
    await expect(page.getByText('Testing general PIN phone enquiry')).toBeVisible()
  })

  test('prisoner cannot send another message until staff replies', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [prisonerSentMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await expect(page.getByText('You can’t send another message until staff reply to this one.')).toBeVisible()
    await expect(appViewPage.sendButton).not.toBeVisible()
    await expect(appViewPage.replyHeading).not.toBeVisible()
  })

  test('prisoner can send a message when latest message is from staff', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [prisonerSentMessage, staffReplyMessage])
    await managingAppsApi.stubAddAppMessage('1')
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await appViewPage.expectReplyFormVisible()
    await appViewPage.fillReply('Prisoner reply to staff message')
    await appViewPage.submitReply()

    await expect(page).toHaveURL('/applications/1')
    const addMessageRequests = await getMatchingRequests({
      method: 'POST',
      urlPath: '/managingPrisonerApps/v1/prisoners/apps/1/messages',
    })
    expect(addMessageRequests.body.requests.length).toBeGreaterThan(0)
  })

  test('no messages can be sent when app is closed', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1', 200, {
      status: 'APPROVED',
    })
    await managingAppsApi.stubGetAppMessages('1', 200, [staffReplyMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await expect(appViewPage.sendButton).not.toBeVisible()
    await expect(appViewPage.replyHeading).not.toBeVisible()
    await expect(page.getByText('You can’t send another message until staff reply to this one.')).not.toBeVisible()
  })

  test('shows validation error when sending an empty message', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [staffReplyMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')
    await appViewPage.expectReplyFormVisible()

    await appViewPage.submitReply()

    await expect(page).toHaveURL('/applications/1')
    await appViewPage.expectValidationSummary()
  })

  test('shows validation error when message is longer than 500 characters', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [staffReplyMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')
    await appViewPage.expectReplyFormVisible()

    await appViewPage.fillReply('a'.repeat(501))
    await appViewPage.submitReply()

    await expect(page).toHaveURL('/applications/1')
    await expect(page.getByRole('link', { name: 'Messages must be 500 characters or less' })).toBeVisible()
    await expect(page.locator('#reply-error')).toContainText('Messages must be 500 characters or less')
  })

  test('shows rejection reason for rejected app', async ({ page }) => {
    const appViewPage = new AppViewPage(page)

    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1', 200, {
      status: 'REJECTED',
      reason: 'Prisoner has already sent this app',
    })
    await managingAppsApi.stubGetAppMessages('1', 200, [])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await expect(page.getByText('This app has been rejected because you already sent this app')).toBeVisible()
    await expect(appViewPage.sendButton).not.toBeVisible()
  })
})
