import type { SuperAgentRequest } from 'superagent'
import type { PrisonerAppsPage } from '../../server/@types/managingAppsApi'

import {
  appTypePendingResponse,
  prisonerAppsPageResponse,
  prisonerClosedAppsPageResponse,
  viewAppResponse,
} from '../../server/testData'
import { groups } from '../../server/testData/groups/groups'
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

  stubGetPrisonerOpenApps: (
    httpStatus = 200,
    responseBody: PrisonerAppsPage = prisonerAppsPageResponse,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/managingPrisonerApps/v1/prisoners/apps',
        queryParameters: { scope: { equalTo: 'OPEN' } },
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: responseBody,
      },
    }),

  stubGetPrisonerClosedApps: (
    httpStatus = 200,
    responseBody: PrisonerAppsPage = prisonerClosedAppsPageResponse,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/managingPrisonerApps/v1/prisoners/apps',
        queryParameters: { scope: { equalTo: 'CLOSED' } },
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: responseBody,
      },
    }),

  async stubGetPrisonerApps(
    httpStatus = 200,
    openAppsResponse: PrisonerAppsPage = prisonerAppsPageResponse,
    closedAppsResponse: PrisonerAppsPage = prisonerClosedAppsPageResponse,
  ): Promise<void> {
    await Promise.all([
      this.stubGetPrisonerOpenApps(httpStatus, openAppsResponse),
      this.stubGetPrisonerClosedApps(httpStatus, closedAppsResponse),
    ])
  },

  stubGetGroupsAndTypes: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/managingPrisonerApps/v1/prisoners/apps/groups',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: groups,
      },
    }),

  stubSubmitApp: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/managingPrisonerApps/v1/prisoners/apps',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...viewAppResponse,
          id: 'app-123',
        },
      },
    }),

  stubGetPrisonerAppById: (id = '1', httpStatus = 200, appOverrides: Record<string, unknown> = {}): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/managingPrisonerApps/v1/prisoners/apps/${id}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...viewAppResponse,
          ...appOverrides,
          id,
        },
      },
    }),

  stubGetAppMessages: (
    appId = '1',
    httpStatus = 200,
    contents: Array<{
      id: string
      appId: string
      message: string
      prisonerNumber: string
      createdDate: string
      createdBy: unknown
    }> = [],
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/managingPrisonerApps/v1/prisoners/apps/${appId}/messages`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          page: 1,
          totalElements: contents.length,
          exhausted: true,
          contents,
        },
      },
    }),

  stubAddAppMessage: (appId = '1', httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: `/managingPrisonerApps/v1/prisoners/apps/${appId}/messages`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          message: 'ok',
        },
      },
    }),

  stubGetPendingAppType: (appTypeId: number, count = 0, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/managingPrisonerApps/v1/prisoners/apps/${appTypeId}/pending`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...appTypePendingResponse,
          id: appTypeId,
          totalAppsInPending: count,
        },
      },
    }),
}
