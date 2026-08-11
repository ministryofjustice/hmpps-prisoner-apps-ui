import { Request } from 'express'
import { recordAppLoggingMetric } from './recordAppLoggingMetric'
import { APP_LOGGING_METRIC_EVENTS } from '../../constants/metrics'

describe('recordAppLoggingMetric', () => {
  const buildReq = (metrics?: { journeyId: string; events: { event: string; timestamp: string }[] }) =>
    ({ session: { metrics } }) as unknown as Request

  it('starts a new journey with a journeyId and appends an event with an ISO timestamp', () => {
    const req = buildReq()

    recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED)

    expect(req.session.metrics.journeyId).toEqual(expect.any(String))
    expect(req.session.metrics.events).toHaveLength(1)
    expect(req.session.metrics.events[0].event).toBe(APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED)
    expect(req.session.metrics.events[0].timestamp).toBe(
      new Date(req.session.metrics.events[0].timestamp).toISOString(),
    )
  })

  it('appends events to an existing journey preserving order and journeyId', () => {
    const req = buildReq({
      journeyId: 'existing-journey',
      events: [{ event: APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED, timestamp: '2026-01-01T00:00:00.000Z' }],
    })

    recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_TYPE_VIEWED)

    expect(req.session.metrics.journeyId).toBe('existing-journey')
    expect(req.session.metrics.events.map(metric => metric.event)).toEqual([
      APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED,
      APP_LOGGING_METRIC_EVENTS.APP_TYPE_VIEWED,
    ])
  })

  it('starts a fresh journey with a new journeyId when start is true, discarding previous events', () => {
    const req = buildReq({
      journeyId: 'old-journey',
      events: [{ event: APP_LOGGING_METRIC_EVENTS.APP_TYPE_VIEWED, timestamp: '2026-01-01T00:00:00.000Z' }],
    })

    recordAppLoggingMetric(req, APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED, { start: true })

    expect(req.session.metrics.journeyId).not.toBe('old-journey')
    expect(req.session.metrics.events).toHaveLength(1)
    expect(req.session.metrics.events[0].event).toBe(APP_LOGGING_METRIC_EVENTS.APP_GROUP_VIEWED)
  })
})
