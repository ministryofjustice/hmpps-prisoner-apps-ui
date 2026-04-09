import { Request, Response, Router } from 'express'

import type { Services } from '../../services'
import { Page } from '../../services/auditService'

import viewAppsRouter from './view'

export default function applicationsRoutes({ auditService, exampleService }: Services): Router {
  const router = Router()

  router.get('/', async (req: Request, res: Response, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const currentTime = await exampleService.getCurrentTime()
    return res.render('pages/index', { currentTime })
  })

  router.use(viewAppsRouter({ auditService }))

  return router
}
