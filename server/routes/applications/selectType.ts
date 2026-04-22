import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { components } from '../../@types/managing-prisoner-apps-api'
import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

type ApplicationTypeResponse = components['schemas']['ApplicationTypeResponse']

const ERROR_MESSAGE = 'Choose one application type'

export default function selectTypeRouter({
  auditService,
  managingAppsService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
}): Router {
  const router = Router()

  const buildTypes = (types: ApplicationTypeResponse[], selectedValue: string | null) =>
    types.map(type => ({
      value: type.id.toString(),
      text: type.name,
      checked: selectedValue === type.id.toString(),
    }))

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

    const types = selectedGroup.appTypes ?? []
    const selectedValue = req.session?.applicationData?.type?.value || null

    await auditService.logPageView(Page.LOG_TYPE_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.SELECT_TYPE, {
      title: 'Select application type',
      types: buildTypes(types, selectedValue),
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
        types: buildTypes(types, null),
        errorMessage: ERROR_MESSAGE,
        errorSummary: [{ text: ERROR_MESSAGE, href: '#type' }],
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
