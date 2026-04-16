import type { SuperAgentRequest } from 'superagent'

import { prisonerAppsPageResponse } from '../../server/testData'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/managingPrisonerApps/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubGetPrisonerApps: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/managingPrisonerApps/v1/prisoners/apps',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonerAppsPageResponse,
      },
    }),
}
