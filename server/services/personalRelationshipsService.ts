import PersonalRelationshipsApiClient from '../data/personalRelationshipsClient'
import type { ReferenceCode } from '../@types/personalRelationshipsApi'

export default class PersonalRelationshipsService {
  constructor(private readonly personalRelationshipsApiClient: PersonalRelationshipsApiClient) {}

  getRelationships(groupCode: string): Promise<ReferenceCode[] | null> {
    return this.personalRelationshipsApiClient.getRelationships(groupCode)
  }
}
