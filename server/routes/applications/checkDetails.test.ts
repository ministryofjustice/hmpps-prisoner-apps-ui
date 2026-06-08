import type { Express } from 'express'
import request from 'supertest'
import { AppResponsePrisoner } from '../../@types/managingAppsApi'
import { URLS } from '../../constants/urls'
import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import { appWithAllRoutes, user } from '../testutils/appSetup'

jest.mock('../../services/auditService')
jest.mock('../../services/managingAppsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const managingAppsService = new ManagingAppsService(null) as jest.Mocked<ManagingAppsService>

let app: Express

beforeEach(() => {
  auditService.logPageView.mockResolvedValue(null)
  managingAppsService.submitApp.mockResolvedValue({ id: 'app-123' } as AppResponsePrisoner)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /log/confirm', () => {
  it('should render check details page with application data', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
          type: { key: 'EMERGENCY_CREDIT', name: 'Emergency Credit', value: '1' },
          additionalData: { amount: '50', reason: 'Emergency expenses' },
        },
      },
    })

    return request(app)
      .get(URLS.LOG_CONFIRM_DETAILS)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Check details')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOG_CHECK_DETAILS_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })

  it('should redirect to group selection when no group', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          type: { key: 'EMERGENCY_CREDIT', name: 'Emergency Credit', value: '1' },
        },
      },
    })

    return request(app).get(URLS.LOG_CONFIRM_DETAILS).expect(302).expect('Location', URLS.LOG_GROUP)
  })

  it('should redirect to type selection when no type', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    return request(app).get(URLS.LOG_CONFIRM_DETAILS).expect(302).expect('Location', URLS.LOG_GROUP)
  })
})

describe('POST /log/confirm', () => {
  it('should submit application and redirect to confirmation', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
          type: { key: 'EMERGENCY_CREDIT', name: 'Emergency Credit', value: '1' },
          additionalData: { amount: '50', reason: 'Emergency expenses' },
        },
      },
    })

    return request(app)
      .post(URLS.LOG_CONFIRM_DETAILS)
      .expect(302)
      .expect('Location', URLS.LOG_CONFIRMATION)
      .expect(() => {
        expect(managingAppsService.submitApp).toHaveBeenCalledWith(user.userId, {
          applicationType: 1,
          genericForm: false,
          requests: expect.arrayContaining([
            expect.objectContaining({
              amount: '50',
              reason: 'Emergency expenses',
            }),
          ]),
        })
      })
  })

  it('should handle submission errors gracefully', () => {
    managingAppsService.submitApp.mockRejectedValueOnce(new Error('API Error'))

    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
          type: { key: 'EMERGENCY_CREDIT', name: 'Emergency Credit', value: '1' },
          additionalData: { amount: '50', reason: 'Emergency expenses' },
        },
      },
    })

    return request(app).post(URLS.LOG_CONFIRM_DETAILS).expect(500)
  })
})
