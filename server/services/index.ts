import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import ManagingAppsService from './managingAppsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, managingAppsApiClient, hmppsAuthClient } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    managingAppsService: new ManagingAppsService(managingAppsApiClient),
  }
}

export type Services = ReturnType<typeof services>
