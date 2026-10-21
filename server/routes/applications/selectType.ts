import { Request, Response, Router } from 'express'
import { format } from 'date-fns'
import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import { ApplicationGroup } from '../../@types/managingAppsApi'
import { APP_LOGGING_METRIC_EVENTS } from '../../constants/metrics'
import { recordAppLoggingMetric } from '../../helpers/application/recordAppLoggingMetric'

type AppTypeItem = { value: string; text: string; checked: boolean } | { divider: 'or' }

const ERROR_MESSAGE = 'Choose an app type'

export default function selectTypeRouter({
  auditService,
  managingAppsService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
}): Router {
  const router = Router()

  const buildAppTypes = (group: ApplicationGroup, selectedValue: string | null): AppTypeItem[] => {
    const items: AppTypeItem[] = []
    const appTypes = group.appTypes ?? []

    const genericAppTypes = appTypes.filter(appType => appType.genericType)
    const nonGenericAppTypes = appTypes.filter(appType => !appType.genericType)

    nonGenericAppTypes.forEach(appType => {
      items.push({
        value: appType.id.toString(),
        text: appType.name,
        checked: selectedValue === appType.id.toString(),
      })
    })

    if (genericAppTypes.length === 1 && nonGenericAppTypes.length > 0) {
      items.push({ divider: 'or' })
    }

    if (genericAppTypes.length > 0) {
      genericAppTypes.forEach(appType => {
        items.push({
          value: appType.id.toString(),
          text: appType.name,
          checked: selectedValue === appType.id.toString(),
        })
      })
    }

    return items
  }

  router.get(URLS.LOG_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals

    const selectedGroupValue = req.session?.applicationData?.group?.value
    if (!selectedGroupValue) {
      res.redirect(URLS.LOG_GROUP)
      return
    }

    const groups = await managingAppsService.getGroupsAndTypes(user.userId)
    const selectedGroup = groups.find(group => group.id.toString() === selectedGroupValue)

    if (!selectedGroup) {
      res.redirect(URLS.LOG_GROUP)
      return
    }

    const selectedValue = req.session?.applicationData?.type?.value || null

    await auditLogged(
      'VIEW_LOG_APPLICATION_TYPE_PAGE',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationGroupId: selectedGroupValue, ...extraDetails },
        })
      },
      async () => {
        recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_TYPE_VIEWED)

        res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
          title: 'Select app type',
          types: buildAppTypes(selectedGroup, selectedValue),
          selectedGroupName: selectedGroup.name,
          errorMessage: null,
        })
      },
    )
  })

  router.post(URLS.LOG_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals
    const selectedValue = req.body.type
    const selectedGroupValue = req.session?.applicationData?.group?.value
    const auditDetails = { applicationGroupId: selectedGroupValue, applicationTypeId: selectedValue }
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'CREATE_APPLICATION_TYPE_SELECTION',
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
      if (!selectedGroupValue) {
        auditOutcomeLogged = true
        await logFailure({ ...auditDetails, failureReason: 'Application group is missing' })
        res.redirect(URLS.LOG_GROUP)
        return
      }

      const groups = await managingAppsService.getGroupsAndTypes(user.userId)
      const selectedGroup = groups.find(group => group.id.toString() === selectedGroupValue)

      if (!selectedGroup) {
        auditOutcomeLogged = true
        await logFailure({ ...auditDetails, failureReason: 'Application group not found' })
        res.redirect(URLS.LOG_GROUP)
        return
      }

      const types = selectedGroup.appTypes ?? []
      const selectedType = types.find(type => type.id.toString() === selectedValue)

      if (!selectedType) {
        auditOutcomeLogged = true
        await logFailure({ ...auditDetails, failureReason: 'Invalid application type' })
        res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
          title: 'Select application type',
          types: buildAppTypes(selectedGroup, null),
          selectedGroupName: selectedGroup.name,
          errorMessage: ERROR_MESSAGE,
          errorSummary: [{ text: ERROR_MESSAGE, href: '#type' }],
        })
        return
      }

      req.session.applicationData = {
        ...req.session.applicationData,
        type: {
          key: selectedType.name
            .replace(/[^\w\s]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-'),
          name: selectedType.name,
          value: selectedType.id.toString(),
          genericType: selectedType.genericType ?? undefined,
          genericForm: selectedType.genericForm ?? undefined,
        },
        additionalData: undefined,
      }

      const pendingAppTypeCount = await managingAppsService.getPendingAppTypeCount(user.userId, selectedType.id)
      const totalAppsInPending = pendingAppTypeCount.totalAppsInPending ?? 0

      if (totalAppsInPending >= 1) {
        auditOutcomeLogged = true
        await logFailure({ ...auditDetails, failureReason: 'Application submission limit reached' })
        res.render(PATHS.LOG_APPLICATION.LIMIT_APP_SUBMISSION, {
          appTypeName: pendingAppTypeCount.name,
          submittedDate: format(pendingAppTypeCount.latestAppSubmittedDate, 'dd/MM/yyyy'),
        })
        return
      }

      auditOutcomeLogged = true
      await logSuccess(auditDetails)
      res.redirect(URLS.LOG_APPLICATION_DETAILS)
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
