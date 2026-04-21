import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import getApplicationDetails from '../../utils/getAppDetails'

import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

export default function appDetailsRouter({
  auditService,
  managingAppsService,
  personalRelationshipsService,
}: {
  auditService: AuditService
   managingAppsService: ManagingAppsService
  personalRelationshipsService: PersonalRelationshipsService
}): Router {
  const router = Router()

  router.get(URLS.LOG_APPLICATION_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    const groups = await managingAppsService.getGroupsAndTypes(user.userId)

    const selectedGroup = groups.find(group => group.id.toString() === applicationData.group?.value)
    if (!selectedGroup) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const selectedAppType = selectedGroup.appTypes.find(type => type.id.toString() === applicationData.type?.value)

    if (!selectedAppType) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const isGeneric = selectedAppType.genericType || selectedAppType.genericForm

    const logDetails = getAppTypeLogDetailsData(selectedAppType.id, applicationData?.additionalData || {}, isGeneric)

    const templateFields = await getApplicationDetails(
      logDetails,
      personalRelationshipsService,
      undefined,
      applicationData.earlyDaysCentre,
    )

    await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.APPLICATION_DETAILS, {
      ...templateFields,
      applicationType: applicationData?.type,
      title: 'Log details',
      isGeneric,
    })
  })

  return router
}
