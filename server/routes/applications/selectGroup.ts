import { Request, Response, Router } from 'express'
import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import { components } from '../../@types/managing-prisoner-apps-api'
import { getAppGroupCard } from '../../constants/appGroupCards'
import { APP_LOGGING_METRIC_EVENTS } from '../../constants/metrics'
import { recordAppLoggingMetric } from '../../helpers/application/recordAppLoggingMetric'

type ApplicationGroup = components['schemas']['ApplicationGroupResponse']

const ERROR_MESSAGE = 'Choose an app group'

export default function selectGroupRouter({
  auditService,
  managingAppsService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
}): Router {
  const router = Router()

  const buildGroups = (groups: ApplicationGroup[], selectedValue: string | null) =>
    groups.map(group => {
      const { image, description } = getAppGroupCard(group.name)
      return {
        value: group.id.toString(),
        text: group.name,
        checked: selectedValue === group.id.toString(),
        image,
        description,
      }
    })

  router.get(URLS.LOG_GROUP, async (req: Request, res: Response) => {
    const { user } = res.locals

    await auditLogged(
      'VIEW_LOG_APPLICATION_GROUP_PAGE',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: extraDetails,
        })
      },
      async () => {
        recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED, { start: true })

        const groups = await managingAppsService.getGroupsAndTypes(user.userId)
        const selectedValue = req.session?.applicationData?.group?.value || null

        res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
          title: 'Select app group',
          groups: buildGroups(groups, selectedValue),
          errorMessage: null,
        })
      },
    )
  })

  router.post(URLS.LOG_GROUP, async (req: Request, res: Response) => {
    const { user } = res.locals
    const auditDetails = { applicationGroupId: req.body.group }
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'CREATE_APPLICATION_GROUP_SELECTION',
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
      const groups = await managingAppsService.getGroupsAndTypes(user.userId)
      const selectedGroup = groups.find(group => group.id.toString() === req.body.group)

      if (!selectedGroup) {
        auditOutcomeLogged = true
        await logFailure({ ...auditDetails, failureReason: 'Invalid application group' })
        res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
          title: 'Select app group',
          groups: buildGroups(groups, null),
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#group' }],
        })
        return
      }

      req.session.applicationData = {
        ...req.session.applicationData,
        group: { name: selectedGroup.name, value: selectedGroup.id.toString() },
        type: undefined,
        additionalData: undefined,
      }

      auditOutcomeLogged = true
      await logSuccess({ applicationGroupId: selectedGroup.id })
      res.redirect(URLS.LOG_TYPE)
    } catch (error) {
      if (!auditOutcomeLogged) {
        auditOutcomeLogged = true
        await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      }
      throw error
    }
  })

  return router
}
