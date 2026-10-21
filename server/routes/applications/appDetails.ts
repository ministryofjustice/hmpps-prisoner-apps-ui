import { Request, Response, Router } from 'express'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'

import { countries } from '../../constants/countries'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import AuditService from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'

import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'
import getApplicationDetails from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import { handleApplicationDetails } from '../../utils/handleAppDetails'
import getFormattedRelationshipDropdown from '../../utils/formatters/getFormattedRelationshipDropdown'
import { getFormattedCountries } from '../../utils/data/countries'
import { APP_LOGGING_METRIC_EVENTS } from '../../constants/metrics'
import { recordAppLoggingMetric } from '../../helpers/application/recordAppLoggingMetric'

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
      res.redirect(URLS.LOG_GROUP)
      return
    }

    const selectedAppType = selectedGroup.appTypes.find(type => type.id.toString() === applicationData.type?.value)

    if (!selectedAppType) {
      res.redirect(URLS.LOG_TYPE)
      return
    }

    const isGeneric = selectedAppType.genericType || selectedAppType.genericForm

    const logDetails = getAppTypeLogDetailsData(selectedAppType.id, applicationData?.additionalData || {}, isGeneric)

    if (!logDetails) {
      res.redirect(URLS.LOG_TYPE)
      return
    }

    await auditLogged(
      'VIEW_LOG_APPLICATION_DETAILS_PAGE',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: selectedAppType.id, ...extraDetails },
        })
      },
      async () => {
        const templateFields = await getApplicationDetails(logDetails, personalRelationshipsService, undefined)

        recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_CREATION_PAGE_VIEWED)

        res.render(PATHS.LOG_APPLICATION.APPLICATION_DETAILS, {
          ...templateFields,
          applicationType: applicationData?.type,
          title: 'Add details',
          isGeneric,
          backLink: URLS.LOG_TYPE,
        })
      },
    )
  })

  router.post(URLS.LOG_APPLICATION_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const auditDetails = { applicationTypeId: applicationData?.type?.value }
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'CREATE_APPLICATION_DETAILS',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { ...auditDetails, ...extraDetails },
        })
      },
    )

    await logAttempt(auditDetails)

    let auditOutcomeLogged = false
    try {
      const applicationType = await getAppType(managingAppsService, user, applicationData?.type.value)

      const formAccepted = await handleApplicationDetails(req, res, {
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

      auditOutcomeLogged = true
      if (formAccepted) {
        await logSuccess(auditDetails)
      } else {
        await logFailure({ ...auditDetails, failureReason: 'Validation failed' })
      }
    } catch (error) {
      if (!auditOutcomeLogged) {
        auditOutcomeLogged = true
        await logFailure({
          ...auditDetails,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        })
      }
      throw error
    }
  })

  return router
}
