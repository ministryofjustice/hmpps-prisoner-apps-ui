import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { dataAccess } from '../data'
import logger from '../../logger'
import AuditService from './auditService'
import ManagingAppsService from './managingAppsService'
import PersonalRelationshipsService from './personalRelationshipsService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    managingAppsApiClient,
    personalRelationshipsClient,
    osPlacesApiClient,
    hmppsAuthClient,
  } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService: new AuditService(hmppsAuditClient),
    managingAppsService: new ManagingAppsService(managingAppsApiClient),
    personalRelationshipsService: new PersonalRelationshipsService(personalRelationshipsClient),
    osPlacesAddressService: new OsPlacesAddressService(logger, osPlacesApiClient),
  }
}

export type Services = ReturnType<typeof services>
