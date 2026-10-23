import { Request, Response, Router } from 'express'
import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import AuditService from '../../services/auditService'

import { URLS } from '../../constants/urls'

export default function cancelAppRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_CANCEL_APPLICATION, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    await auditLogged(
      'DELETE_APPLICATION_DRAFT',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: {
            ...(applicationData?.type?.value ? { applicationTypeId: applicationData.type.value } : {}),
            ...extraDetails,
          },
        })
      },
      async () => {
        delete req.session.applicationData
        res.redirect('/')
      },
    )
  })

  return router
}
