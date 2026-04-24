import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'

import { ReferenceCode } from '../@types/personalRelationshipsApi'
import config from '../config'

export default class PersonalRelationshipsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Personal Relationships API', config.apis.personalRelationships, logger, authenticationClient)
  }

  getRelationships(groupCode: string): Promise<ReferenceCode[]> {
    return this.get<ReferenceCode[]>(
      {
        path: `/reference-codes/group/${groupCode}`,
      },
      asSystem(),
    ).catch(error => {
      logger.error(`Personal Relationships API unavailable for groupCode=${groupCode}`, error)
      return []
    })
  }
}
