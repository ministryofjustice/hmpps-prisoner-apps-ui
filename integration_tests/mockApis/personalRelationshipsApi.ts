import type { SuperAgentRequest } from 'superagent'

import { stubFor } from './wiremock'

const relationshipCodes = [
  {
    code: 'FREIND',
    description: 'Friend',
    isActive: true,
  },
  {
    code: 'SOLICITOR',
    description: 'Solicitor',
    isActive: true,
  },
]

export default {
  stubGetRelationships: (httpStatus = 200): SuperAgentRequest[] => {
    const groupCodes = ['SOCIAL_RELATIONSHIP', 'OFFICIAL_RELATIONSHIP']

    return groupCodes.map(groupCode =>
      stubFor({
        request: {
          method: 'GET',
          urlPath: `/personalRelationships/reference-codes/group/${groupCode}`,
        },
        response: {
          status: httpStatus,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: relationshipCodes,
        },
      }),
    )
  },
}
