import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { ViewAppListDto } from '../@types/managingAppsApi'
import config from '../config'
import logger from '../../logger'

export default class ManagingAppsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Managing Apps API', config.apis.managingAppsApi, logger, authenticationClient)
  }

  getPrisonerApps(userId: string) {
    return this.get<ViewAppListDto[]>({ path: '/v1/prisoners/apps' }, asSystem(userId))
  }
}
