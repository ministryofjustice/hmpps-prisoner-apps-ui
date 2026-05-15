import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import { ApplicationGroup } from '../../@types/managingAppsApi'

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

    const genericAppType = appTypes.find(appType => appType.genericType)
    const nonGenericAppTypes = appTypes.filter(appType => !appType.genericType)

    nonGenericAppTypes.forEach(appType => {
      items.push({
        value: appType.id.toString(),
        text: appType.name,
        checked: selectedValue === appType.id.toString(),
      })
    })

    if (genericAppType) {
      if (nonGenericAppTypes.length > 0) {
        items.push({ divider: 'or' })
      }

      items.push({
        value: genericAppType.id.toString(),
        text: genericAppType.name,
        checked: selectedValue === genericAppType.id.toString(),
      })
    }

    return items
  }

  router.get(URLS.LOG_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals

    const selectedGroupValue = req.session?.applicationData?.group?.value
    if (!selectedGroupValue) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const groups = await managingAppsService.getGroupsAndTypes(user.userId)
    const selectedGroup = groups.find(group => group.id.toString() === selectedGroupValue)

    if (!selectedGroup) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const selectedValue = req.session?.applicationData?.type?.value || null

    await auditService.logPageView(Page.LOG_TYPE_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
      title: 'Select app type',
      types: buildAppTypes(selectedGroup, selectedValue),
      selectedGroupName: selectedGroup.name,
      errorMessage: null,
    })
  })

  router.post(URLS.LOG_TYPE, async (req: Request, res: Response) => {
    const { user } = res.locals
    const selectedValue = req.body.type

    const selectedGroupValue = req.session?.applicationData?.group?.value
    if (!selectedGroupValue) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const groups = await managingAppsService.getGroupsAndTypes(user.userId)
    const selectedGroup = groups.find(group => group.id.toString() === selectedGroupValue)

    if (!selectedGroup) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const types = selectedGroup.appTypes ?? []
    const selectedType = types.find(type => type.id.toString() === selectedValue)

    if (!selectedType) {
      return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
        title: 'Select application type',
        types: buildAppTypes(selectedGroup, null),
        selectedGroupName: selectedGroup.name,
        errorMessage: ERROR_MESSAGE,
        errorSummary: [{ text: ERROR_MESSAGE, href: '#type' }],
      })
    }

    const pendingAppType = await managingAppsService.getPendingAppTypeCount(user.userId, selectedType.id)
    if (pendingAppType.count >= 1) {
      return res.render(PATHS.LOG_APPLICATION.LIMIT_APP_SUBMISSION, {
        appTypeName: pendingAppType.name,
      })
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

    return res.redirect(URLS.LOG_APPLICATION_DETAILS)
  })

  return router
}
