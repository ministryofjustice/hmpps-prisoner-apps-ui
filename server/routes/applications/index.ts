import { Request, Response, Router } from 'express'

import type { Services } from '../../services'
import { URLS } from '../../constants/urls'

import viewAppsRouter from './view'
import selectGroupRouter from './selectGroup'
import selectTypeRouter from './selectType'
import appDetailsRouter from './appDetails'

export default function applicationsRoutes({
  auditService,
  managingAppsService,
  personalRelationshipsService,
}: Services): Router {
  const router = Router()

  router.get('/', (req: Request, res: Response) => {
    return res.redirect(URLS.APPLICATIONS)
  })

  router.use(viewAppsRouter({ auditService, managingAppsService }))
  router.use(appDetailsRouter({ auditService, personalRelationshipsService }))
  router.use(selectGroupRouter({ auditService, managingAppsService }))
  router.use(selectTypeRouter({ auditService, managingAppsService }))
  router.use(appDetailsRouter({ auditService, personalRelationshipsService }))
  return router
}
