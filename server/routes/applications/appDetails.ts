import { Request, Response, Router } from 'express'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'

import { countries } from '../../constants/countries'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'
import getApplicationDetails from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import getFormattedRelationshipDropdown from '../../utils/formatters/getFormattedRelationshipDropdown'
import { getFormattedCountries } from '../../utils/data/countries'

export default function appDetailsRouter({
  auditService,
  managingAppsService,
  personalRelationshipsService,
  osPlacesAddressService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
  personalRelationshipsService: PersonalRelationshipsService
  osPlacesAddressService?: OsPlacesAddressService
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
      return res.redirect(URLS.LOG_TYPE)
    }

    const isGeneric = selectedAppType.genericType || selectedAppType.genericForm

    const logDetails = getAppTypeLogDetailsData(selectedAppType.id, applicationData?.additionalData || {}, isGeneric)

    if (!logDetails) {
      return res.redirect(URLS.LOG_TYPE)
    }

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
      backLink: URLS.LOG_TYPE,
    })
  })

  router.post(URLS.LOG_APPLICATION_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    const applicationType = await getAppType(managingAppsService, user, applicationData?.type.value)

    return handleApplicationDetails(req, res, {
      getAppType: () => applicationType,
      getTemplateData: async () => {
        const groupCode =
          applicationType.id === 1
            ? PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP
            : PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP

        const formattedRelationshipList = await getFormattedRelationshipDropdown(
          personalRelationshipsService,
          undefined,
          groupCode,
        )

        const formattedCountryList = getFormattedCountries(countries, req.body.country)

        return {
          applicationType: applicationData.type,
          formattedRelationshipList,
          countries: formattedCountryList,
          isGeneric: applicationType.genericType || applicationType.genericForm,
        }
      },
      isUpdate: false,
      renderPath: PATHS.LOG_APPLICATION.APPLICATION_DETAILS,
      successRedirect: () => URLS.LOG_CONFIRM_DETAILS,
      osPlacesAddressService,
    })
  })

  return router
}
