import { Request, Response, Router } from 'express'

import type { Services } from '../../services'
import { URLS } from '../../constants/urls'

import viewAppsRouter from './view'
import selectGroupRouter from './selectGroup'
import selectTypeRouter from './selectType'
import appDetailsRouter from './appDetails'
import confirmationRouter from './confirmation'

export default function applicationsRoutes({
  auditService,
  managingAppsService,
  personalRelationshipsService,
  osPlacesAddressService,
}: Services): Router {
  const router = Router()

  router.get('/', (req: Request, res: Response) => {
    return res.redirect(URLS.APPLICATIONS)
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
  router.use(confirmationRouter({ auditService }))
  router.get('/api/addresses/find/:query', async (req: Request<{ query: string }>, res: Response) => {
    try {
      const { query } = req.params
      if (!query) {
        res.status(400).json({ status: 400, error: 'Query parameter is required' })
        return
      }

      const results = await osPlacesAddressService.getAddressesMatchingQuery(query)

      res.json({ status: 200, results })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      res.status(500).json({ status: 500, error: errorMessage })
    }
  })

  return router
}
