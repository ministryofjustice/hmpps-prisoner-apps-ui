import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import { prisonerAppsResponse } from '../testData'
import AuditService, { Page } from '../services/auditService'
import ManagingAppsService from '../services/managingAppsService'

jest.mock('../services/auditService')
jest.mock('../services/managingAppsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
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
  it('should redirect to applications page', () => {
    return request(app).get('/').expect(302).expect('Location', '/applications')
  })
})

describe('GET /applications', () => {
  it('should render applications page', () => {
    auditService.logPageView.mockResolvedValue(null)
    managingAppsService.getPrisonerApps.mockResolvedValue(prisonerAppsResponse)

    return request(app)
      .get('/applications')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.VIEW_APPLICATIONS_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
        expect(managingAppsService.getPrisonerApps).toHaveBeenCalledWith(user.userId)
      })
  })

  it('service errors are handled', () => {
    auditService.logPageView.mockResolvedValue(null)
    managingAppsService.getPrisonerApps.mockRejectedValue(new Error('Some problem calling external api!'))

    return request(app)
      .get('/applications')
      .expect('Content-Type', /html/)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some problem calling external api!')
      })
  })
})
