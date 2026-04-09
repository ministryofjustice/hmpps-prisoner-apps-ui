import { Request, Response, Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

import { URLS } from '../../constants/urls'
import { PATHS } from '../../constants/paths'

import { getPaginationData } from '../../utils/http/pagination'

export default function viewAppsRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.APPLICATIONS, async (req: Request, res: Response) => {
    await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    res.render(PATHS.APPLICATIONS.LIST, {
      pagination: getPaginationData(Number(req.query.page) || 1, 20),
      query: req.query,
    })
  })

  return router
}
