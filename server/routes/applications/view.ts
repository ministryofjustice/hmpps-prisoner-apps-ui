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

    await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const prisonerApps = await managingAppsService.getPrisonerApps(userId)

    const page = Number(req.query.page) || 1
    const pagination = getPaginationData(page, prisonerApps.length, ITEMS_PER_PAGE)

    const pageStart = (pagination.page - 1) * ITEMS_PER_PAGE
    const apps = formatAppsToRows(prisonerApps.slice(pageStart, pageStart + ITEMS_PER_PAGE))

    res.render(PATHS.APPLICATIONS.LIST, {
      apps,
      pagination,
      query: req.query,
    })
  })

  return router
}
