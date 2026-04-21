import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import getApplicationDetails from '../../utils/getAppDetails'

import AuditService, { Page } from '../../services/auditService'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

export default function appDetailsRouter({
  auditService,
  personalRelationshipsService,
}: {
  auditService: AuditService
  personalRelationshipsService: PersonalRelationshipsService
}): Router {
  const router = Router()

  router.get(URLS.LOG_APPLICATION_DETAILS, async (req: Request, res: Response) => {
    const { applicationData } = req.session

    const logDetails = getAppTypeLogDetailsData(undefined, applicationData?.additionalData || {}, undefined)

    const templateFields = await getApplicationDetails(logDetails, personalRelationshipsService, undefined, undefined)

    await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.APPLICATION_DETAILS, {
      ...templateFields,
      applicationType: applicationData?.type,
      title: 'Log details',
    })
  })

  return router
}
