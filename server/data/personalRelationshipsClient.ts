import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'

import { ReferenceCode } from '../@types/personalRelationshipsApi'
import config from '../config'

export default class PersonalRelationshipsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Personal Relationships API', config.apis.personalRelationships, logger, authenticationClient)
  }

  getRelationships(groupCode: string): Promise<ReferenceCode[] | null> {
    try {
      return this.get<ReferenceCode[]>({
        path: `/reference-codes/group/${groupCode}`,
      })
    } catch (error) {
      logger.error(`Error fetching relationships for group code ${groupCode}.`, error)
      return null
    }
  }
}
