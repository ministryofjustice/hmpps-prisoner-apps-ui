import type {
  ApplicationGroup,
  AppRequestPrisoner,
  AppResponsePrisoner,
  PrisonerAppsPage,
  AppMessages,
  AppPrisonerMessage,
  PendingAppTypeCount,
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

  getPrisonerAppById(userId: string, id: string): Promise<AppResponsePrisoner> {
    return this.managingAppsApiClient.getPrisonerAppById(userId, id)
  }

  getPendingAppTypeCount(userId: string, appTypeId: number): Promise<PendingAppTypeCount> {
    return this.managingAppsApiClient.getPendingAppTypeCount(userId, appTypeId)
  }

  getAppMessages(userId: string, appId: string, page: number, size: number): Promise<AppMessages> {
    return this.managingAppsApiClient.getAppMessages(userId, appId, page, size)
  }

  addAppMessage(userId: string, appId: string, message: string, visibility: string): Promise<AppPrisonerMessage> {
    return this.managingAppsApiClient.addAppMessage(userId, appId, message, visibility)
  }
}
