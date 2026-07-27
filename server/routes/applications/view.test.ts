import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import ManagingAppsService from '../../services/managingAppsService'
import AuditService from '../../services/auditService'
import { REJECTION_REASON_MAP } from '../../constants/applicationStatus'
import type { components } from '../../@types/managing-prisoner-apps-api'

jest.mock('../../services/managingAppsService')
jest.mock('../../services/auditService')

const managingAppsService = new ManagingAppsService(null) as jest.Mocked<ManagingAppsService>
const auditService = new AuditService(null) as jest.Mocked<AuditService>

const mockMessagesResponse: components['schemas']['PageResultComments'] = {
  page: 1,
  totalElements: 0,
  exhausted: true,
  contents: [],
}

const createMockApp = (overrides = {}): components['schemas']['AppResponsePrisonerDtoObjectObject'] => ({
  id: '1',
  reference: 'APP-001',
  assignedGroup: null,
  applicationType: {
    id: 7,
    name: 'Make a general PIN phone enquiry',
  },
  genericForm: true,
  applicationGroup: {
    id: 1,
    name: 'PIN Phone',
  },
  requestedDate: '2024-01-10T10:30:00Z',
  createdDate: '2024-01-10T10:30:00Z',
  createdBy: 'user123',
  lastModifiedDate: null,
  lastModifiedBy: null,
  requests: [
    {
      details: 'Testing general PIN phone enquiry',
    },
  ],
  requestedBy: null,
  requestedByFirstName: 'John',
  requestedByLastName: 'Doe',
  status: 'PENDING',
  establishmentId: 'MDI',
  ...overrides,
})

let app: Express

beforeEach(() => {
  jest.clearAllMocks()
  auditService.logPageView.mockResolvedValue(null)
  managingAppsService.getAppMessages.mockResolvedValue(mockMessagesResponse)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /applications/:id - View App Route', () => {
  describe('Rejection Reason Mapping', () => {
    it('maps known rejection reason "Prisoner has already sent this app"', async () => {
      const mockApp = createMockApp({
        status: 'REJECTED',
        rejectionReason: 'Prisoner has already sent this app',
        reason: null,
      })

      managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

      app = appWithAllRoutes({
        services: { managingAppsService, auditService },
        userSupplier: () => user,
      })

      return request(app)
        .get('/applications/1')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This app has been rejected because you already sent this app')
          expect(res.text).toContain('Rejected')
        })
    })

    it('maps known rejection reason "Prisoner used the wrong app"', async () => {
      const mockApp = createMockApp({
        status: 'REJECTED',
        rejectionReason: 'Prisoner used the wrong app',
        reason: null,
      })

      managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

      app = appWithAllRoutes({
        services: { managingAppsService, auditService },
        userSupplier: () => user,
      })

      return request(app)
        .get('/applications/1')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This app has been rejected because you used the wrong app')
          expect(res.text).toContain('Rejected')
        })
    })

    it('maps known rejection reason "Prisoner sent an abusive app"', async () => {
      const mockApp = createMockApp({
        status: 'REJECTED',
        rejectionReason: 'Prisoner sent an abusive app',
        reason: null,
      })

      managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

      app = appWithAllRoutes({
        services: { managingAppsService, auditService },
        userSupplier: () => user,
      })

      return request(app)
        .get('/applications/1')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This app has been rejected because you sent an abusive app')
          expect(res.text).toContain('Rejected')
        })
    })

    it('does not show rejection reason for APPROVED status', async () => {
      const mockApp = createMockApp({
        status: 'APPROVED',
        rejectionReason: null,
        reason: 'Application approved',
      })

      managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

      app = appWithAllRoutes({
        services: { managingAppsService, auditService },
        userSupplier: () => user,
      })

      return request(app)
        .get('/applications/1')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Application approved')
        })
    })

    it('does not show rejection reason for DECLINED status', async () => {
      const mockApp = createMockApp({
        status: 'DECLINED',
        rejectionReason: null,
        reason: 'Application declined',
      })

      managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

      app = appWithAllRoutes({
        services: { managingAppsService, auditService },
        userSupplier: () => user,
      })

      return request(app)
        .get('/applications/1')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Application declined')
        })
    })

    it('renders page successfully with proper status tag for rejected app', async () => {
      const mockApp = createMockApp({
        status: 'REJECTED',
        rejectionReason: 'Prisoner has already sent this app',
        reason: null,
      })

      managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

      app = appWithAllRoutes({
        services: { managingAppsService, auditService },
        userSupplier: () => user,
      })

      return request(app)
        .get('/applications/1')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Make a general PIN phone enquiry')
          expect(res.text).toContain('Rejected')
        })
    })
  })

  describe('Rejection reason mappings', () => {
    Object.entries(REJECTION_REASON_MAP).forEach(([reasonCode, displayMessage]) => {
      it(`correctly displays "${displayMessage}" for reason code "${reasonCode}"`, async () => {
        const mockApp = createMockApp({
          status: 'REJECTED',
          rejectionReason: reasonCode,
          reason: null,
        })

        managingAppsService.getPrisonerAppById.mockResolvedValue(mockApp)

        app = appWithAllRoutes({
          services: { managingAppsService, auditService },
          userSupplier: () => user,
        })

        return request(app)
          .get('/applications/1')
          .expect('Content-Type', /html/)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain(displayMessage)
          })
      })
    })
  })
})
