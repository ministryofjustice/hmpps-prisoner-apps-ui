import type { ApplicationGroup, PrisonerAppsPage } from '../@types/managingAppsApi'
import ManagingAppsApiClient from '../data/managingAppsApiClient'

export default class ManagingAppsService {
  constructor(private readonly managingAppsApiClient: ManagingAppsApiClient) {}

  getPrisonerApps(userId: string, pageNum: number, pageSize?: number): Promise<PrisonerAppsPage> {
    return this.managingAppsApiClient.getPrisonerApps(userId, pageNum, pageSize)
  }

  getGroupsAndTypes(): Promise<ApplicationGroup[]> {
    return this.managingAppsApiClient.getGroupsAndTypes()
  }
}
