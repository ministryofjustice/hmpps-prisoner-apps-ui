import type { ViewAppListDto } from '../@types/managingAppsApi'
import ManagingAppsApiClient from '../data/managingAppsApiClient'

export default class ManagingAppsService {
  constructor(private readonly managingAppsApiClient: ManagingAppsApiClient) {}

  getPrisonerApps(userId: string): Promise<ViewAppListDto[]> {
    return this.managingAppsApiClient.getPrisonerApps(userId)
  }
}
