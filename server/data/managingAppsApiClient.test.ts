import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import ManagingAppsApiClient from './managingAppsApiClient'
import config from '../config'

describe('ManagingAppsApiClient', () => {
  let managingAppsApiClient: ManagingAppsApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    managingAppsApiClient = new ManagingAppsApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getPrisonerApps', () => {
    it('should make a GET request to getPrisonerApps endpoint and return the response body', async () => {
      const userId = 'A1234BC'

      nock(config.apis.managingAppsApi.url)
        .get('/v1/prisoners/apps')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, [{ id: 'app-1' }])

      const response = await managingAppsApiClient.getPrisonerApps(userId)

      expect(response).toEqual([{ id: 'app-1' }])
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledWith(userId)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })
})
