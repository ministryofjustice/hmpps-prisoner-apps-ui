import { Request, Response, Router } from 'express'
import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'

import type { Services } from '../../services'
import { PATHS } from '../../constants/paths'

import viewAppsRouter from './view'
import selectGroupRouter from './selectGroup'
import selectTypeRouter from './selectType'
import appDetailsRouter from './appDetails'
import checkDetailsRouter from './checkDetails'
import confirmationRouter from './confirmation'
import cancelAppRouter from './cancelApp'

export default function applicationsRoutes({
  auditService,
  managingAppsService,
  personalRelationshipsService,
  osPlacesAddressService,
}: Services): Router {
  const router = Router()

  router.get('/', async (req: Request, res: Response) => {
    await auditLogged(
      'VIEW_MANAGE_APPS_LANDING',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: res.locals.user.username,
          correlationId: req.id,
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details: extraDetails,
        })
      },
      async () => {
        res.render(PATHS.LANDING)
      },
    )
  })

  router.use(viewAppsRouter({ auditService, managingAppsService }))
  router.use(
    appDetailsRouter({
      auditService,
      managingAppsService,
      personalRelationshipsService,
      osPlacesAddressService,
    }),
  )
  router.use(selectGroupRouter({ auditService, managingAppsService }))
  router.use(selectTypeRouter({ auditService, managingAppsService }))
  router.use(checkDetailsRouter({ auditService, managingAppsService }))
  router.use(confirmationRouter({ auditService }))
  router.use(cancelAppRouter({ auditService }))
  router.get('/api/addresses/find/:query', async (req: Request<{ query: string }>, res: Response) => {
    const { query } = req.params

    try {
      let results: Awaited<ReturnType<typeof osPlacesAddressService.getAddressesMatchingQuery>> = []

      await auditLogged(
        'SEARCH_ADDRESS',
        async (what, extraDetails = {}) => {
          await auditService.logAuditEvent({
            what,
            who: res.locals.user.username,
            correlationId: req.id,
            subjectId: query,
            subjectType: 'SEARCH_TERM',
            details: extraDetails,
          })
        },
        async () => {
          results = await osPlacesAddressService.getAddressesMatchingQuery(query)
        },
      )

      return res.json({ status: 200, results })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return res.status(500).json({ status: 500, error: errorMessage })
    }
  })

  return router
}
