import { Request, Response } from 'express'
import checkActiveAgencyAccess from './checkActiveAgencyAccess'

const mockNext = jest.fn()

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    render: jest.fn(),
  } as unknown as Response
}

function mockReq(agencyId?: string) {
  return {
    user: agencyId
      ? {
          authSource: 'prisoner-auth',
          username: 'A1234BC',
          establishment: { agency_id: agencyId, name: 'Ranby', display_name: 'Ranby', youth: false },
        }
      : undefined,
  } as unknown as Request
}

describe('checkActiveAgencyAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 403 for RNI in non-production environments', () => {
    const req = mockReq('RNI')
    const res = mockRes()

    checkActiveAgencyAccess()(req, res, mockNext)

    expect(mockNext).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('autherror')
  })

  it('calls next() for CKI in non-production environments', () => {
    const req = mockReq('CKI')
    const res = mockRes()

    checkActiveAgencyAccess()(req, res, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('calls next() for WLI in non-production environments', () => {
    const req = mockReq('WLI')
    const res = mockRes()

    checkActiveAgencyAccess()(req, res, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('returns 403 for a non-allowed establishment', () => {
    const req = mockReq('LEI')
    const res = mockRes()

    checkActiveAgencyAccess()(req, res, mockNext)

    expect(mockNext).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('autherror')
  })

  it('returns 403 when user is missing', () => {
    const req = mockReq()
    const res = mockRes()

    checkActiveAgencyAccess()(req, res, mockNext)

    expect(mockNext).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('autherror')
  })

  it('returns 403 when establishment agency_id is missing', () => {
    const req = {
      user: {
        authSource: 'prisoner-auth',
        username: 'A1234BC',
        establishment: null,
      },
    } as unknown as Request
    const res = mockRes()

    checkActiveAgencyAccess()(req, res, mockNext)

    expect(mockNext).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('autherror')
  })
})
