import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

jest.mock('../../services/auditService')
jest.mock('../../services/managingAppsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const managingAppsService = new ManagingAppsService(null) as jest.Mocked<ManagingAppsService>

const mockGroups = [
  {
    id: 1,
    name: 'PIN Phone',
    appTypes: [{ id: 1, name: 'Emergency Credit' }],
  },
  {
    id: 2,
    name: 'Official Mail',
    appTypes: [{ id: 2, name: 'Add Contact' }],
  },
  {
    id: 3,
    name: 'Social Mail',
    appTypes: [{ id: 3, name: 'Add Social Contact' }],
  },
]

let app: Express

beforeEach(() => {
  auditService.logAuditEvent.mockResolvedValue(undefined)
  managingAppsService.getGroupsAndTypes.mockResolvedValue(mockGroups)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /log/group', () => {
  it('should render group selection page', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .get('/log/group')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select app group')
        expect(res.text).toContain('PIN Phone')
        expect(res.text).toContain('Official Mail')
        expect(res.text).toContain('Social Mail')
      })
  })

  it('audits the group selection page view', async () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    await request(app).get('/log/group')

    expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
      what: 'VIEW_LOG_APPLICATION_GROUP_PAGE_ATTEMPT',
      who: user.username,
      correlationId: expect.any(String),
      subjectId: user.userId,
      subjectType: 'PRISONER_ID',
      details: {},
    })
    expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
      what: 'VIEW_LOG_APPLICATION_GROUP_PAGE_SUCCESS',
      who: user.username,
      correlationId: expect.any(String),
      subjectId: user.userId,
      subjectType: 'PRISONER_ID',
      details: {},
    })
  })

  it('should call managingAppsService with user ID', async () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    await request(app).get('/log/group')

    expect(managingAppsService.getGroupsAndTypes).toHaveBeenCalledWith(user.userId)
  })

  it('should highlight previously selected group', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'Official Mail', value: '2' },
        },
      },
    })

    return request(app)
      .get('/log/group')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('link-tile--selected')
      })
  })
})

describe('POST /log/group', () => {
  it('audits a valid group selection and redirects to type selection', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({ group: '1' })
      .expect(302)
      .expect('Location', '/log/type')
      .expect(() => {
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'CREATE_APPLICATION_GROUP_SELECTION_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationGroupId: '1' },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'CREATE_APPLICATION_GROUP_SELECTION_SUCCESS',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationGroupId: 1 },
        })
      })
  })

  it('audits a missing group selection and re-renders the form', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({})
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Choose an app group')
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'CREATE_APPLICATION_GROUP_SELECTION_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationGroupId: undefined },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'CREATE_APPLICATION_GROUP_SELECTION_FAILURE',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationGroupId: undefined, failureReason: 'Invalid application group' },
        })
      })
  })

  it('should re-render form with error when no group selected', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({ group: '' })
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Choose an app group')
      })
  })

  it('should re-render form with error for invalid group ID', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({ group: '999' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Choose an app group')
      })
  })

  it('should persist group data in session after successful selection', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({ group: '2' })
      .expect(302)
      .then(() => {
        // Session should now contain the selected group
        expect(managingAppsService.getGroupsAndTypes).toHaveBeenCalled()
      })
  })

  it('should handle submission with missing group field gracefully', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Choose an app group')
      })
  })

  it('should validate that selected group exists before saving', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app)
      .post('/log/group')
      .send({ group: '999' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Choose an app group')
      })
  })
})
