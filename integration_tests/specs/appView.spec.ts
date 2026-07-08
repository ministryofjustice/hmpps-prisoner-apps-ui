import { expect, test } from '@playwright/test'

import managingAppsApi from '../mockApis/managingAppsApi'
import { getMatchingRequests } from '../mockApis/wiremock'
import { prisonerSentMessage, staffReplyMessage } from '../../server/testData/applications/messages'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'

test.describe('App view', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('clicking View from app list opens submitted app page', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1')
    await loginWithPrisonerAuth(page)

    await page.goto('/applications')
    await expect(page.locator('[data-qa="app-results-table"]')).toBeVisible()

    await page.getByRole('link', { name: 'View' }).first().click()

    await expect(page).toHaveURL('/applications/1')
    await expect(page.getByRole('heading', { name: 'Make a general PIN phone enquiry', level: 1 })).toBeVisible()
    await expect(page.getByText('You have sent this app and staff will process it as soon as possible.')).toBeVisible()
    await expect(page.getByText('Testing general PIN phone enquiry')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back to apps home' })).toBeVisible()
  })

  test('prisoner cannot send another message until staff replies', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [prisonerSentMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await expect(page.getByText('You can’t send another message until staff reply to this one.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Send a reply' })).not.toBeVisible()
  })

  test('prisoner can send a message when latest message is from staff', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [prisonerSentMessage, staffReplyMessage])
    await managingAppsApi.stubAddAppMessage('1')
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await expect(page.getByRole('heading', { name: 'Send a reply' })).toBeVisible()
    await page.fill('#reply', 'Prisoner reply to staff message')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page).toHaveURL('/applications/1')
    const addMessageRequests = await getMatchingRequests({
      method: 'POST',
      urlPath: '/managingPrisonerApps/v1/prisoners/apps/1/comments',
    })
    expect(addMessageRequests.body.requests.length).toBeGreaterThan(0)
  })

  test('no messages can be sent when app is closed', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1', 200, {
      status: 'APPROVED',
    })
    await managingAppsApi.stubGetAppMessages('1', 200, [staffReplyMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')

    await expect(page.getByRole('button', { name: 'Send' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Send a reply' })).not.toBeVisible()
    await expect(page.getByText('You can’t send another message until staff reply to this one.')).not.toBeVisible()
  })

  test('shows validation error when sending an empty message', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [staffReplyMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')
    await expect(page.getByRole('heading', { name: 'Send a reply' })).toBeVisible()

    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page).toHaveURL('/applications/1')
    await expect(page.getByText('There is a problem')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Add a comment' })).toBeVisible()
  })

  test('shows validation error when message is longer than 500 characters', async ({ page }) => {
    await managingAppsApi.stubGetPrisonerApps()
    await managingAppsApi.stubGetPrisonerAppById('1')
    await managingAppsApi.stubGetAppMessages('1', 200, [staffReplyMessage])
    await loginWithPrisonerAuth(page)

    await page.goto('/applications/1')
    await expect(page.getByRole('heading', { name: 'Send a reply' })).toBeVisible()

    await page.fill('#reply', 'a'.repeat(501))
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page).toHaveURL('/applications/1')
    await expect(page.getByRole('link', { name: 'Comments must be 500 characters or less' })).toBeVisible()
    await expect(page.locator('#reply-error')).toContainText('Comments must be 500 characters or less')
  })
})
