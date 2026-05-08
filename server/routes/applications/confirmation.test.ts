import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService, { Page } from '../../services/auditService'

jest.mock('../../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

const sessionDataWithApplication = {
  applicationData: {
    group: { name: 'PIN Phone', value: '1' },
    type: { key: 'ADD_EMERGENCY_PIN_PHONE_CREDIT', name: 'Add emergency PIN phone credit', value: '1' },
  },
}

let app: Express

beforeEach(() => {
  auditService.logPageView.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /log/confirmation', () => {
  it('renders the confirmation page with group and type from session', () => {
    app = appWithAllRoutes({
      services: { auditService },
      userSupplier: () => user,
      sessionData: sessionDataWithApplication,
    })

    return request(app)
      .get('/log/confirmation')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('You have sent your app')
        expect(res.text).toContain('Add emergency PIN phone credit')
        expect(res.text).toContain('You have sent a new app to staff.')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOG_CONFIRMATION_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })

  it('redirects to group selection when session has no group', () => {
    app = appWithAllRoutes({
      services: { auditService },
      userSupplier: () => user,
    })

    return request(app).get('/log/confirmation').expect(302).expect('Location', '/log/group')
  })

  it('redirects to group selection when session has no type', () => {
    app = appWithAllRoutes({
      services: { auditService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    return request(app).get('/log/confirmation').expect(302).expect('Location', '/log/group')
  })
})
