import type {
  ApplicationGroup,
  AppRequestPrisoner,
  AppResponsePrisoner,
  PrisonerAppsPage,
} from '../@types/managingAppsApi'
import ManagingAppsApiClient from '../data/managingAppsApiClient'

export default class ManagingAppsService {
  constructor(private readonly managingAppsApiClient: ManagingAppsApiClient) {}

  getPrisonerApps(userId: string, pageNum: number, pageSize?: number): Promise<PrisonerAppsPage> {
    return this.managingAppsApiClient.getPrisonerApps(userId, pageNum, pageSize)
  }

  getGroupsAndTypes(userId: string): Promise<ApplicationGroup[]> {
    return this.managingAppsApiClient.getGroupsAndTypes(userId)
  }

  submitApp(userId: string, body: AppRequestPrisoner): Promise<AppResponsePrisoner> {
    return this.managingAppsApiClient.submitApp(userId, body)
  }
}
