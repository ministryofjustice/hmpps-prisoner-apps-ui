import { Request, Response, Router } from 'express'
import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'

export default function confirmationRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  if (process.env.NODE_ENV !== 'production') {
    router.get(`${URLS.LOG_CONFIRMATION}/test`, async (req: Request, res: Response) => {
      const { user } = res.locals

      await auditLogged(
        'CREATE_TEST_APPLICATION_SESSION',
        async (what, extraDetails = {}) => {
          await auditService.logAuditEvent({
            what,
            who: user.username,
            correlationId: req.id,
            subjectId: 'NONE',
            subjectType: 'NOT_APPLICABLE',
            details: { applicationTypeId: '1', ...extraDetails },
          })
        },
        async () => {
          req.session.applicationData = {
            group: { name: 'PIN Phone', value: '1' },
            type: { key: 'ADD_EMERGENCY_PIN_PHONE_CREDIT', name: 'Add emergency PIN phone credit', value: '1' },
          }
          res.redirect(URLS.LOG_CONFIRMATION)
        },
      )
    })
  }

  router.get(URLS.LOG_CONFIRMATION, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData } = req.session

    if (!applicationData?.group?.value || !applicationData?.type?.value) {
      res.redirect(URLS.LOG_GROUP)
      return
    }

    const { group, type, applicationId } = applicationData

    await auditLogged(
      'VIEW_LOG_APPLICATION_CONFIRMATION_PAGE',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: req.id,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: {
            applicationTypeId: type.value,
            ...(applicationId ? { applicationId } : {}),
            ...extraDetails,
          },
        })
      },
      async () => {
        req.session.applicationData = undefined

        res.render(PATHS.LOG_APPLICATION.CONFIRMATION, {
          title: type.name,
          groupName: group.name,
          applicationId,
        })
      },
    )
  })

  return router
}
