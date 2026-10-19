import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import { prisonerAppsPageResponse } from '../testData'
import AuditService from '../services/auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import ManagingAppsService from '../services/managingAppsService'

jest.mock('../services/auditService')
jest.mock('../services/managingAppsService')

const auditService = new AuditService({} as HmppsAuditClient) as jest.Mocked<AuditService>
const managingAppsService = new ManagingAppsService(null) as jest.Mocked<ManagingAppsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      managingAppsService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render landing page and audit the view', () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Manage apps')
        expect(res.text).toContain('/log/group')
        expect(res.text).toContain('/applications')
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'VIEW_MANAGE_APPS_LANDING_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details: {},
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'VIEW_MANAGE_APPS_LANDING_SUCCESS',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details: {},
        })
      })
  })
})

describe('GET /applications', () => {
  it('should render the open apps tab by default', () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)
    managingAppsService.getPrisonerApps.mockResolvedValue(prisonerAppsPageResponse)

    return request(app)
      .get('/applications')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'VIEW_APPLICATIONS_PAGE_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: {},
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'VIEW_APPLICATIONS_PAGE_SUCCESS',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: {},
        })
        expect(managingAppsService.getPrisonerApps).toHaveBeenCalledWith(user.userId, 1, 'OPEN', 10)
      })
  })

  it('should render the closed apps tab when requested', () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)
    managingAppsService.getPrisonerApps.mockResolvedValue(prisonerAppsPageResponse)

    return request(app)
      .get('/applications?tab=closed')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(managingAppsService.getPrisonerApps).toHaveBeenCalledWith(user.userId, 1, 'CLOSED', 10)
      })
  })

  it('should fall back to the open apps tab for an unknown tab value', () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)
    managingAppsService.getPrisonerApps.mockResolvedValue(prisonerAppsPageResponse)

    return request(app)
      .get('/applications?tab=unknown')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(managingAppsService.getPrisonerApps).toHaveBeenCalledWith(user.userId, 1, 'OPEN', 10)
      })
  })

  it('service errors are handled', () => {
    auditService.logAuditEvent.mockResolvedValue(undefined)
    managingAppsService.getPrisonerApps.mockRejectedValue(new Error('Some problem calling api'))

    return request(app)
      .get('/applications')
      .expect('Content-Type', /html/)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some problem calling api')
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'VIEW_APPLICATIONS_PAGE_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: {},
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'VIEW_APPLICATIONS_PAGE_FAILURE',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { failureReason: 'Some problem calling api' },
        })
      })
  })
})
