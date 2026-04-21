import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import type { ApplicationGroup, PrisonerAppsPage } from '../@types/managingAppsApi'
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
}
