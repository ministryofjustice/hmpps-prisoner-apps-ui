import { Request, Response, Router } from 'express'
import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

import buildCheckDetailsSummary, { getPinPhoneSummaryListHeading } from '../../utils/buildCheckDetailsSummary'
import { APP_LOGGING_METRIC_EVENTS } from '../../constants/metrics'
import { recordAppLoggingMetric } from '../../helpers/application/recordAppLoggingMetric'
import logger from '../../../logger'
import type { JourneyEventsRequest } from '../../@types/managingAppsApi'

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
      res.redirect(URLS.LOG_GROUP)
      return
    }

    const { group, type, additionalData } = applicationData

    const isGeneric = !!(type.genericType || type.genericForm)
    const typeId = parseInt(type.value, 10)

    await auditLogged(
      'VIEW_LOG_APPLICATION_CHECK_DETAILS_PAGE',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: typeId, ...extraDetails },
        })
      },
      async () => {
        const summaryRows = buildCheckDetailsSummary(
          typeId,
          additionalData as Record<string, unknown> | undefined,
          isGeneric,
        )

        res.render(PATHS.LOG_APPLICATION.CHECK_DETAILS, {
          title: 'Check details',
          applicationType: type,
          groupName: group.name,
          summaryRows,
          sectionHeading: getPinPhoneSummaryListHeading(typeId, isGeneric),
          isGeneric,
          backLink: URLS.LOG_APPLICATION_DETAILS,
        })
      },
    )
  })

  router.post(URLS.LOG_CONFIRM_DETAILS, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session
    const auditDetails = { applicationTypeId: applicationData?.type?.value }
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'CREATE_APPLICATION',
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
      if (!applicationData?.group?.value || !applicationData?.type?.value) {
        auditOutcomeLogged = true
        await logFailure({ ...auditDetails, failureReason: 'Application group or type is missing' })
        res.redirect(URLS.LOG_GROUP)
        return
      }

      const { type, additionalData } = applicationData

      const isGeneric = !!(type.genericType || type.genericForm)
      const typeId = parseInt(type.value, 10)

      const submittedApp = await managingAppsService.submitApp(user.userId, {
        applicationType: typeId,
        genericForm: isGeneric,
        requests: [{ ...(additionalData as Record<string, unknown>) }],
      })

      recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_SUBMITTED)

      if (submittedApp.id && req.session.metrics) {
        await managingAppsService
          .submitJourneyEvents(user.userId, {
            appId: submittedApp.id,
            events: req.session.metrics.events as JourneyEventsRequest['events'],
          } as JourneyEventsRequest)
          .catch(error => logger.error(error, 'Failed to record application journey events'))
        delete req.session.metrics
      }

      req.session.applicationData = {
        ...applicationData,
        applicationId: submittedApp.id ?? undefined,
      }

      auditOutcomeLogged = true
      await logSuccess({ ...auditDetails, applicationId: submittedApp.id })
      res.redirect(URLS.LOG_CONFIRMATION)
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
