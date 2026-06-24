import type { Request, Response, NextFunction } from 'express'
import logger from '../../logger'
import config from '../config'
import type { HmppsUser } from '../interfaces/hmppsUser'

export default function setUpAllowedPrisonerMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user as HmppsUser | undefined
  if (!user || !user.userId) {
    logger.warn('Allowed prisoner list: User not found or missing userId')
    return res.status(401).render('autherror')
  }

  const prisonerId = user.userId.toUpperCase()
  const isAllowed = config.allowedPrisonerList.includes(prisonerId)

  if (!isAllowed) {
    logger.info(`Allowed prisoner list: Access blocked for prisoner ${prisonerId}`)
    return res.status(403).render('autherror')
  }

  logger.debug(`Allowed prisoner list: Access allowed for prisoner ${prisonerId}`)
  return next()
}
