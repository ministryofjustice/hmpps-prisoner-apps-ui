/* eslint-disable import/first */
import { OsPlacesApiClient } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import ManagingAppsApiClient from './managingAppsApiClient'
import PersonalRelationshipsApiClient from './personalRelationshipsClient'

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    managingAppsApiClient: new ManagingAppsApiClient(hmppsAuthClient),
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    personalRelationshipsClient: new PersonalRelationshipsApiClient(hmppsAuthClient),
    osPlacesApiClient: new OsPlacesApiClient(logger, config.apis.osPlacesApi),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export {
  AuthenticationClient,
  HmppsAuditClient,
  ManagingAppsApiClient,
  PersonalRelationshipsApiClient,
  OsPlacesApiClient,
}
