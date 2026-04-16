import ManagingAppsApiClient from '../data/managingAppsApiClient'
import ManagingAppsService from './managingAppsService'
import { prisonerAppsPageResponse } from '../testData/applications/app'

jest.mock('../data/managingAppsApiClient')

describe('ManagingAppsService', () => {
  const managingAppsApiClient = new ManagingAppsApiClient(null) as jest.Mocked<ManagingAppsApiClient>
  let managingAppsService: ManagingAppsService

  beforeEach(() => {
    jest.clearAllMocks()
    managingAppsService = new ManagingAppsService(managingAppsApiClient)
  })

  it('should call getPrisonerApps on the api client and return its result', async () => {
    const userId = 'A1234BC'
    const pageNum = 1
    const pageSize = 10
    const expectedAppsPage = prisonerAppsPageResponse

    managingAppsApiClient.getPrisonerApps.mockResolvedValue(expectedAppsPage)

    const result = await managingAppsService.getPrisonerApps(userId, pageNum, pageSize)

    expect(managingAppsApiClient.getPrisonerApps).toHaveBeenCalledWith(userId, pageNum, pageSize)
    expect(managingAppsApiClient.getPrisonerApps).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedAppsPage)
  })

  it('should call getPrisonerApps without pageSize when not provided', async () => {
    const userId = 'A1234BC'
    const pageNum = 1
    const expectedAppsPage = prisonerAppsPageResponse

    managingAppsApiClient.getPrisonerApps.mockResolvedValue(expectedAppsPage)

    const result = await managingAppsService.getPrisonerApps(userId, pageNum)

    expect(managingAppsApiClient.getPrisonerApps).toHaveBeenCalledWith(userId, pageNum, undefined)
    expect(managingAppsApiClient.getPrisonerApps).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedAppsPage)
  })
})
