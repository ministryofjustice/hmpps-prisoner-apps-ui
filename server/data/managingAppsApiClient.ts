import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import type {
  ApplicationGroup,
  AppMessages,
  AppPrisonerMessage,
  AppRequestPrisoner,
  AppResponsePrisoner,
  PrisonerAppsPage,
  PendingAppTypeCount,
} from '../@types/managingAppsApi'
import config from '../config'

export default class ManagingAppsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Managing Apps API', config.apis.managingAppsApi, logger, authenticationClient)
  }

  getPrisonerApps(userId: string, pageNum: number, pageSize?: number) {
    const query = pageSize === undefined ? { pageNum } : { pageNum, pageSize }

    return this.get<PrisonerAppsPage>(
      {
        path: '/v1/prisoners/apps',
        query,
      },
      asSystem(userId),
    )
  }

  getGroupsAndTypes(userId: string): Promise<ApplicationGroup[] | null> {
    try {
      return this.get<ApplicationGroup[]>(
        {
          path: `/v1/prisoners/apps/groups`,
        },
        asSystem(userId),
      )
    } catch (error) {
      logger.error(`Error fetching application groups and types.`, error)
      return null
    }
  }

  submitApp(userId: string, body: AppRequestPrisoner): Promise<AppResponsePrisoner> {
    return this.post<AppResponsePrisoner>(
      {
        path: '/v1/prisoners/apps',
        data: body,
      },
      asSystem(userId),
    )
  }

  getPrisonerAppById(userId: string, id: string): Promise<AppResponsePrisoner> {
    return this.get<AppResponsePrisoner>(
      {
        path: `/v1/prisoners/apps/${encodeURIComponent(id)}`,
      },
      asSystem(userId),
    )
  }

  getPendingAppTypeCount(userId: string, appTypeId: number): Promise<PendingAppTypeCount> {
    return this.get<PendingAppTypeCount>(
      {
        path: `/v1/prisoners/apps/${encodeURIComponent(appTypeId)}/pending`,
      },
      asSystem(userId),
    )
  }

  getAppMessages(userId: string, appId: string, page: number, size: number): Promise<AppMessages> {
    return this.get<AppMessages>(
      {
        path: `/v1/prisoners/apps/${encodeURIComponent(appId)}/comments`,
        query: { page, size },
      },
      asSystem(userId),
    )
  }

  addAppMessage(userId: string, appId: string, message: string, visibility: string): Promise<AppPrisonerMessage> {
    return this.post<AppPrisonerMessage>(
      {
        path: `/v1/prisoners/apps/${encodeURIComponent(appId)}/comments`,
        data: { message, visibility },
      },
      asSystem(userId),
    )
  }
}
