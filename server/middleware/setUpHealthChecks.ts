import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'
import express, { Router } from 'express'

import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'
import { ACTIVE_AGENCIES } from '../constants/activeAgencies'
import AuditService, { Page } from '../services/auditService'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo, auditService: AuditService): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis).filter(([, options]) => 'healthPath' in options) as Array<
    [string, { healthPath: string; url: string; timeout: { response: number; deadline: number }; agent: AgentConfig }]
  >

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig.map(([name, options]) => endpointHealthComponent(logger, name, options)),
  })

  router.get('/test-audit', async (req, res) => {
    await auditService.logPageView('TEST_AUDIT_PATH' as Page, {
      who: 'test-user',
      correlationId: req.id,
    })
    res.send('WORKED')
  })

  router.get('/health', middleware.health)
  router.get(
    '/info',
    (_req, _res, next) => {
      // eslint-disable-next-line no-param-reassign
      applicationInfo.additionalFields = { activeAgencies: [...ACTIVE_AGENCIES] }
      next()
    },
    middleware.info,
  )
  router.get('/ping', middleware.ping)

  return router
}
