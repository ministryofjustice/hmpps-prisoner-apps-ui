import type { RequestHandler } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import logger from '../../logger'
import { ACTIVE_AGENCIES } from '../constants/activeAgencies'

export default function checkActiveAgencyAccess(): RequestHandler {
  return (req, res, next) => {
    const user = req.user as LaunchpadUser | undefined

    if (!user) {
      logger.warn('Access denied as user is missing')
      return res.status(403).render('autherror')
    }

    const agencyId = user.establishment?.agency_id
    const isAllowed = !!agencyId && ACTIVE_AGENCIES.includes(agencyId)

    logger.info(`Active agency access check: agencyId=${agencyId}, isAllowed=${isAllowed}`)

    if (isAllowed) {
      return next()
    }

    logger.warn(
      `Access denied for user ${user.username}. agencyId=${agencyId}, activeAgencies=${JSON.stringify(ACTIVE_AGENCIES)}`,
    )
    return res.status(403).render('autherror')
  }
}
