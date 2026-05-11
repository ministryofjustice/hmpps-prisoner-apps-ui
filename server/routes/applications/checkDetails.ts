import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

import buildCheckDetailsSummary from '../../utils/buildCheckDetailsSummary'

export default function checkDetailsRouter({
  auditService,
  managingAppsService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
}): Router {
  const router = Router()

  router.get(URLS.LOG_CONFIRM_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    if (!applicationData?.group?.value || !applicationData?.type?.value) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const { group, type, additionalData } = applicationData

    const isGeneric = !!(type.genericType || type.genericForm)
    const typeId = parseInt(type.value, 10)

    const summaryRows = buildCheckDetailsSummary(
      typeId,
      additionalData as Record<string, unknown> | undefined,
      isGeneric,
      type.name,
    )

    await auditService.logPageView(Page.LOG_CHECK_DETAILS_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.CHECK_DETAILS, {
      title: 'Check details',
      applicationType: type,
      groupName: group.name,
      summaryRows,
      backLink: URLS.LOG_APPLICATION_DETAILS,
    })
  })

  router.post(URLS.LOG_CONFIRM_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    if (!applicationData?.group?.value || !applicationData?.type?.value) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const { type, additionalData } = applicationData

    const isGeneric = !!(type.genericType || type.genericForm)
    const typeId = parseInt(type.value, 10)

    const submittedApp = await managingAppsService.submitApp(user.userId, {
      applicationType: typeId,
      genericForm: isGeneric,
      requests: [{ ...(additionalData as Record<string, unknown>) }],
    })

    req.session.applicationData = {
      ...applicationData,
      applicationId: submittedApp.id ?? undefined,
    }

    return res.redirect(URLS.LOG_CONFIRMATION)
  })

  return router
}
