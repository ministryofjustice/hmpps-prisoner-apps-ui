import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'

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
  auditService.logAuditEvent.mockResolvedValue(undefined)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /log/confirmation/test', () => {
  it('audits setup of test confirmation data and redirects to confirmation', () => {
    app = appWithAllRoutes({
      services: { auditService },
      userSupplier: () => user,
      production: false,
    })

    return request(app)
      .get('/log/confirmation/test')
      .expect(302)
      .expect('Location', '/log/confirmation')
      .expect(() => {
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'CREATE_TEST_APPLICATION_SESSION_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details: { applicationTypeId: '1' },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'CREATE_TEST_APPLICATION_SESSION_SUCCESS',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: 'NONE',
          subjectType: 'NOT_APPLICABLE',
          details: { applicationTypeId: '1' },
        })
      })
  })
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
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'VIEW_LOG_APPLICATION_CONFIRMATION_PAGE_ATTEMPT',
          who: user.username,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          correlationId: expect.any(String),
          details: { applicationTypeId: '1' },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'VIEW_LOG_APPLICATION_CONFIRMATION_PAGE_SUCCESS',
          who: user.username,
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          correlationId: expect.any(String),
          details: { applicationTypeId: '1' },
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
