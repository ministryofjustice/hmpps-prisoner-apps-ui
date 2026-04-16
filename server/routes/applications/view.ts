import { Request, Response, Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

import { URLS } from '../../constants/urls'
import { PATHS } from '../../constants/paths'

import { getPaginationData } from '../../utils/http/pagination'
import { formatAppsToRows } from '../../utils/formatters/formatAppsToRows'

const ITEMS_PER_PAGE = 10

export default function viewAppsRouter({
  auditService,
  managingAppsService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
}): Router {
  const router = Router()

  router.get(URLS.APPLICATIONS, async (req: Request, res: Response) => {
    const { userId } = res.locals.user
    const page = Number(req.query.page) || 1

    await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const prisonerApps = await managingAppsService.getPrisonerApps(userId, page, ITEMS_PER_PAGE)
    const pagination = getPaginationData(page, prisonerApps.totalRecords, ITEMS_PER_PAGE)
    const rows = formatAppsToRows(prisonerApps.apps)

    res.render(PATHS.APPLICATIONS.LIST, {
      apps: rows,
      pagination,
      query: req.query,
    })
  })

  return router
}
