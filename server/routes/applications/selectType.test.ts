import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

jest.mock('../../services/auditService')
jest.mock('../../services/managingAppsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const managingAppsService = new ManagingAppsService(null) as jest.Mocked<ManagingAppsService>

const groupWithTypes = {
  id: 1,
  name: 'PIN Phone',
  appTypes: [
    {
      id: 1,
      name: 'Emergency Credit',
      genericType: false,
      genericForm: false,
    },
    {
      id: 2,
      name: 'Add Contact',
      genericType: false,
      genericForm: false,
    },
  ],
}

const groupWithGenericType = {
  id: 2,
  name: 'Other',
  appTypes: [
    {
      id: 3,
      name: 'Specific App',
      genericType: false,
      genericForm: false,
    },
    {
      id: 4,
      name: 'Generic App',
      genericType: true,
      genericForm: false,
    },
  ],
}

let app: Express

beforeEach(() => {
  auditService.logPageView.mockResolvedValue(null)
  managingAppsService.getGroupsAndTypes.mockResolvedValue([groupWithTypes, groupWithGenericType])
  managingAppsService.getPendingAppTypeCount.mockResolvedValue({
    id: 1,
    name: 'Emergency Credit',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
    totalAppsInPending: 0,
    submittedBy: 'PRISONER',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /log/type', () => {
  it('should render type selection page with session group', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    return request(app)
      .get('/log/type')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select app type')
        expect(res.text).toContain('Emergency Credit')
        expect(res.text).toContain('Add Contact')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOG_TYPE_PAGE, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })

  it('should render types with divider when generic type present', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'Other', value: '2' },
        },
      },
    })

    return request(app)
      .get('/log/type')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Specific App')
        expect(res.text).toContain('Generic App')
      })
  })

  it('should redirect to group selection when no session group', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app).get('/log/type').expect(302).expect('Location', '/log/group')
  })

  it('should redirect to group selection when group not found', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'Unknown', value: '999' },
        },
      },
    })

    return request(app).get('/log/type').expect(302).expect('Location', '/log/group')
  })

  it('should select previously chosen type', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
          type: { key: 'EMERGENCY_CREDIT', name: 'Emergency Credit', value: '1' },
        },
      },
    })

    return request(app)
      .get('/log/type')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('checked')
        expect(res.text).toContain('Emergency Credit')
      })
  })
})

describe('POST /log/type', () => {
  it('should save selected type and redirect to details', async () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    const res = await request(app).post('/log/type').send({ type: '1' })

    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('/log')
  })

  it('should redirect to group when no group in session', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
    })

    return request(app).post('/log/type').send({ type: '1' }).expect(302).expect('Location', '/log/group')
  })

  it('should redirect to group when selected group not found', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'Unknown', value: '999' },
        },
      },
    })

    return request(app).post('/log/type').send({ type: '1' }).expect(302).expect('Location', '/log/group')
  })

  it('should re-render form when type selection invalid', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    return request(app)
      .post('/log/type')
      .send({ type: '' })
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Choose an app type')
      })
  })

  it('should handle missing type parameter', () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    return request(app)
      .post('/log/type')
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Choose an app type')
      })
  })

  it('should call managingAppsService to fetch groups', async () => {
    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    await request(app).post('/log/type').send({ type: '1' })

    expect(managingAppsService.getGroupsAndTypes).toHaveBeenCalledWith(user.userId)
  })

  it('should render limit app submission with formatted submitted date', async () => {
    managingAppsService.getPendingAppTypeCount.mockResolvedValue({
      id: 1,
      name: 'Emergency Credit',
      genericType: false,
      genericForm: false,
      logDetailRequired: false,
      totalAppsInPending: 1,
      latestAppSubmittedDate: '2026-06-25T14:59:15Z',
      submittedBy: 'PRISONER',
    })

    app = appWithAllRoutes({
      services: { auditService, managingAppsService },
      userSupplier: () => user,
      sessionData: {
        applicationData: {
          group: { name: 'PIN Phone', value: '1' },
        },
      },
    })

    const res = await request(app).post('/log/type').send({ type: '1' })

    expect(res.status).toBe(200)
    expect(res.text).toContain('You sent it on 25/06/2026')
  })
})
