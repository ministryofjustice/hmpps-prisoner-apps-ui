import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { PrisonerAppsPage } from '../@types/managingAppsApi'
import config from '../config'
import logger from '../../logger'

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
}
