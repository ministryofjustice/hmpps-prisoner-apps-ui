import ManagingAppsApiClient from '../data/managingAppsApiClient'
import ManagingAppsService from './managingAppsService'

jest.mock('../data/managingAppsApiClient')

describe('ManagingAppsService', () => {
  const managingAppsApiClient = new ManagingAppsApiClient(null) as jest.Mocked<ManagingAppsApiClient>
  let managingAppsService: ManagingAppsService

  beforeEach(() => {
    managingAppsService = new ManagingAppsService(managingAppsApiClient)
  })

  it('should call getPrisonerApps on the api client and return its result', async () => {
    const userId = 'A1234BC'
    const expectedApps = [
      {
        id: 'app-1',
        prisonerId: userId,
        applicationType: 'PIN_PHONE_ADD_NEW_SOCIAL_CONTACT',
        createdDate: '2026-04-01T10:00:00Z',
        lastUpdatedDate: '2026-04-01T10:30:00Z',
        status: 'PENDING' as const,
      },
    ]

    managingAppsApiClient.getPrisonerApps.mockResolvedValue(expectedApps)

    const result = await managingAppsService.getPrisonerApps(userId)

    expect(managingAppsApiClient.getPrisonerApps).toHaveBeenCalledWith(userId)
    expect(managingAppsApiClient.getPrisonerApps).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedApps)
  })
})
