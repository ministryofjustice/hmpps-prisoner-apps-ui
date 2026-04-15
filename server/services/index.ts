import { dataAccess } from '../data'
import AuditService from './auditService'
import ManagingAppsService from './managingAppsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, managingAppsApiClient, hmppsAuthClient } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService: new AuditService(hmppsAuditClient),
    managingAppsService: new ManagingAppsService(managingAppsApiClient),
  }
}

export type Services = ReturnType<typeof services>
