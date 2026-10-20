import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'
import PersonalRelationshipsService from '../../services/personalRelationshipsService'
import { getAppType } from '../../helpers/application/getAppType'
import getApplicationDetails from '../../utils/getAppDetails'
import { getAppTypeLogDetailsData } from '../../utils/getAppTypeLogDetails'
import getFormattedRelationshipDropdown from '../../utils/formatters/getFormattedRelationshipDropdown'
import { URLS } from '../../constants/urls'

jest.mock('../../services/auditService')
jest.mock('../../services/managingAppsService')
jest.mock('../../services/personalRelationshipsService')
jest.mock('../../helpers/application/getAppType')
jest.mock('../../utils/getAppDetails', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('../../utils/getAppTypeLogDetails')
jest.mock('../../utils/formatters/getFormattedRelationshipDropdown', () => ({ __esModule: true, default: jest.fn() }))

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const managingAppsService = new ManagingAppsService(null) as jest.Mocked<ManagingAppsService>
const personalRelationshipsService = new PersonalRelationshipsService(null) as jest.Mocked<PersonalRelationshipsService>

const applicationType = {
  id: 7,
  name: 'Broken laptop',
  key: 'BROKEN_LAPTOP',
  genericType: true,
  genericForm: false,
  logDetailRequired: true,
}

const applicationData = {
  group: { name: 'General enquiry', value: '1' },
  type: { key: applicationType.key, name: applicationType.name, value: '7' },
  additionalData: {},
}

let app: Express

beforeEach(() => {
  jest.clearAllMocks()
  auditService.logAuditEvent.mockResolvedValue(undefined)
  managingAppsService.getGroupsAndTypes.mockResolvedValue([
    { id: 1, name: 'General enquiry', appTypes: [applicationType] },
  ] as never)
    ; (getAppType as jest.Mock).mockResolvedValue(applicationType)
    ; (getAppTypeLogDetailsData as jest.Mock).mockReturnValue({ details: '' })
    ; (getApplicationDetails as jest.Mock).mockResolvedValue({ details: '' })
    ; (getFormattedRelationshipDropdown as jest.Mock).mockResolvedValue([])
})

const createApp = () =>
  appWithAllRoutes({
    services: { auditService, managingAppsService, personalRelationshipsService },
    userSupplier: () => user,
    sessionData: { applicationData },
  })

describe('Application details routes', () => {
  it('audits a successful application details page view', () => {
    app = createApp()

    return request(app)
      .get(URLS.LOG_APPLICATION_DETAILS)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(() => {
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'VIEW_LOG_APPLICATION_DETAILS_PAGE_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: applicationType.id },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'VIEW_LOG_APPLICATION_DETAILS_PAGE_SUCCESS',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: applicationType.id },
        })
      })
  })

  it('audits a successful application details submission', () => {
    app = createApp()

    return request(app)
      .post(URLS.LOG_APPLICATION_DETAILS)
      .send({ details: 'An application detail' })
      .expect(302)
      .expect('Location', URLS.LOG_CONFIRM_DETAILS)
      .expect(() => {
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'CREATE_APPLICATION_DETAILS_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: '7' },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'CREATE_APPLICATION_DETAILS_SUCCESS',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: '7' },
        })
      })
  })

  it('audits validation failure without including submitted details', () => {
    app = createApp()

    return request(app)
      .post(URLS.LOG_APPLICATION_DETAILS)
      .send({ details: '' })
      .expect(200)
      .expect(() => {
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(1, {
          what: 'CREATE_APPLICATION_DETAILS_ATTEMPT',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: '7' },
        })
        expect(auditService.logAuditEvent).toHaveBeenNthCalledWith(2, {
          what: 'CREATE_APPLICATION_DETAILS_FAILURE',
          who: user.username,
          correlationId: expect.any(String),
          subjectId: user.userId,
          subjectType: 'PRISONER_ID',
          details: { applicationTypeId: '7', failureReason: 'Validation failed' },
        })
      })
  })
})
