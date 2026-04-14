import type { SuperAgentRequest } from 'superagent'

import { prisonerAppsResponse } from '../../server/testData'
import { stubFor } from './wiremock'

export default {
  stubGetPrisonerApps: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/managingPrisonerApps/v1/prisoners/apps',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonerAppsResponse,
      },
    }),
}
