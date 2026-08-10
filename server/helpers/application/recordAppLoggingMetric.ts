import { Request } from 'express'
import { randomUUID } from 'crypto'

// eslint-disable-next-line import/prefer-default-export
export const recordAppLoggingMetric = (req: Request, event: string, options?: { start?: boolean }): void => {
  const journey = options?.start || !req.session.metrics ? { journeyId: randomUUID(), events: [] } : req.session.metrics

  journey.events.push({ event, timestamp: new Date().toISOString() })
  req.session.metrics = journey
}
