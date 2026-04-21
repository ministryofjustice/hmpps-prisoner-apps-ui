import { dataAccess } from '../data'
import AuditService from './auditService'
import ManagingAppsService from './managingAppsService'
import PersonalRelationshipsService from './personalRelationshipsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, managingAppsApiClient, personalRelationshipsClient, hmppsAuthClient } =
    dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService: new AuditService(hmppsAuditClient),
    managingAppsService: new ManagingAppsService(managingAppsApiClient),
    personalRelationshipsService: new PersonalRelationshipsService(personalRelationshipsClient),
  }
}

export type Services = ReturnType<typeof services>
