import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService from '../../services/auditService'

import { URLS } from '../../constants/urls'
import { PATHS } from '../../constants/paths'

import { getPaginationData } from '../../utils/http/pagination'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function viewAppsRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(
    URLS.APPLICATIONS,
    asyncMiddleware(async (req: Request, res: Response) => {
      res.render(PATHS.APPLICATIONS.LIST, {
        pagination: getPaginationData(Number(req.query.page) || 1, 20),
        query: req.query,
      })
    }),
  )

  return router
}
