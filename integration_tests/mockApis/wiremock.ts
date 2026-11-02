import superagent, { SuperAgentRequest, Response } from 'superagent'
import { WIREMOCK_BASE_URL } from '../testConfig'

const url = `${WIREMOCK_BASE_URL}/__admin`

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = (body: string | object) => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { stubFor, getMatchingRequests, resetStubs }
