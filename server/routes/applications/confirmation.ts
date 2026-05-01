import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'

export default function confirmationRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  if (process.env.NODE_ENV !== 'production') {
    router.get(`${URLS.LOG_CONFIRMATION}/test`, (req: Request, res: Response) => {
      req.session.applicationData = {
        group: { name: 'PIN Phone', value: '1' },
        type: { key: 'ADD_EMERGENCY_PIN_PHONE_CREDIT', name: 'Add emergency PIN phone credit', value: '1' },
      }
      return res.redirect(URLS.LOG_CONFIRMATION)
    })
  }

  router.get(URLS.LOG_CONFIRMATION, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    if (!applicationData?.group?.value || !applicationData?.type?.value) {
      return res.redirect(URLS.LOG_GROUP)
    }

    const { group, type, applicationId } = applicationData

    await auditService.logPageView(Page.LOG_CONFIRMATION_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    req.session.applicationData = undefined

    return res.render(PATHS.LOG_APPLICATION.CONFIRMATION, {
      title: type.name,
      groupName: group.name,
      applicationId,
    })
  })

  return router
}
