import { Router } from 'express'

import type { Services } from '../services'

import applicationsRoutes from './applications'

export default function routes(services: Services): Router {
  const router = Router()

  router.use('/', applicationsRoutes(services))

  return router
}
