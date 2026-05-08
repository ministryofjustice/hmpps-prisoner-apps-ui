import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import { components } from '../../@types/managing-prisoner-apps-api'

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
    groups.map(group => ({
      value: group.id.toString(),
      text: group.name,
      checked: selectedValue === group.id.toString(),
    }))

  router.get(URLS.LOG_GROUP, async (req: Request, res: Response) => {
    const { user } = res.locals

    const groups = await managingAppsService.getGroupsAndTypes(user.userId)
    const selectedValue = req.session?.applicationData?.group?.value || null

    await auditService.logPageView(Page.LOG_GROUP_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
      title: 'Select app group',
      groups: buildGroups(groups, selectedValue),
      errorMessage: null,
    })
  })

  router.post(URLS.LOG_GROUP, async (req: Request, res: Response) => {
    const { user } = res.locals
    const selectedValue = req.body.group

    const groups = await managingAppsService.getGroupsAndTypes(user.userId)
    const selectedGroup = groups.find(group => group.id.toString() === selectedValue)

    if (!selectedGroup) {
      return res.render(PATHS.LOG_APPLICATION.SELECT_GROUP, {
        title: 'Select app group',
        groups: buildGroups(groups, null),
        errorMessage: ERROR_MESSAGE,
        errorSummary: [{ text: ERROR_MESSAGE, href: '#group' }],
      })
    }

    req.session.applicationData = {
      ...req.session.applicationData,
      group: { name: selectedGroup.name, value: selectedGroup.id.toString() },
      type: undefined,
      additionalData: undefined,
    }

    return res.redirect(URLS.LOG_TYPE)
  })

  return router
}
