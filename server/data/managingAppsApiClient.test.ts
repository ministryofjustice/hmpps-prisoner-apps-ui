import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import ManagingAppsApiClient from './managingAppsApiClient'
import config from '../config'
import { prisonerAppsPageResponse } from '../testData/applications/app'

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
      const pageNum = 1
      const pageSize = 10
      const expectedResponse = prisonerAppsPageResponse

      nock(config.apis.managingAppsApi.url)
        .get('/v1/prisoners/apps')
        .query({ pageNum, pageSize })
        .reply(200, expectedResponse)

      const response = await managingAppsApiClient.getPrisonerApps(userId, pageNum, pageSize)

      expect(response).toEqual(expectedResponse)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledWith(userId)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })

    it('should omit pageSize from query when not provided', async () => {
      const userId = 'A1234BC'
      const pageNum = 2
      const expectedResponse = { ...prisonerAppsPageResponse, page: pageNum }

      nock(config.apis.managingAppsApi.url).get('/v1/prisoners/apps').query({ pageNum }).reply(200, expectedResponse)

      const response = await managingAppsApiClient.getPrisonerApps(userId, pageNum)

      expect(response).toEqual(expectedResponse)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledWith(userId)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })
})
