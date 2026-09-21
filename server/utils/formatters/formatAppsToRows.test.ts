import { format } from 'date-fns'
import { formatAppsToRows } from './formatAppsToRows'

jest.mock('date-fns', () => ({
  format: jest.fn(),
  getTime: jest.fn((date: Date) => date.getTime()),
}))

describe(formatAppsToRows.name, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly format applications into table rows', () => {
    ;(format as jest.Mock).mockReturnValue('10/01/2026')

    const applications = [
      {
        id: 'app-1',
        prisonerId: 'A1234BC',
        applicationType: 'Transfer',
        createdDate: '2024-01-10T00:00:00Z',
        lastUpdatedDate: '2024-01-10T00:00:00Z',
        status: 'NEW' as const,
        messageCount: 3,
      },
    ]

    const result = formatAppsToRows(applications)

    expect(result).toEqual([
      [
        { html: '<a href="/applications/app-1" class="govuk-link">Transfer</a>' },
        {
          text: '10/01/2026',
          attributes: {
            'data-sort-value': '1704844800000',
          },
          classes: 'govuk-!-text-nowrap',
        },
        { html: '<strong class="govuk-tag govuk-tag--light-blue">New</strong>' },
        {
          text: '3',
          format: 'numeric',
          attributes: {
            'data-sort-value': '3',
          },
        },
      ],
    ])
  })

  it('should use the last updated date for the closed tab', () => {
    ;(format as jest.Mock).mockReturnValue('11/01/2026')

    const applications = [
      {
        id: 'app-1',
        prisonerId: 'A1234BC',
        applicationType: 'Transfer',
        createdDate: '2024-01-10T00:00:00Z',
        lastUpdatedDate: '2024-01-11T00:00:00Z',
        status: 'APPROVED' as const,
      },
    ]

    const result = formatAppsToRows(applications, 'closed')

    expect(result).toEqual([
      [
        { html: '<a href="/applications/app-1" class="govuk-link">Transfer</a>' },
        {
          text: '11/01/2026',
          attributes: {
            'data-sort-value': '1704931200000',
          },
          classes: 'govuk-!-text-nowrap',
        },
        { html: '<strong class="govuk-tag govuk-tag--green">Approved</strong>' },
        {
          text: '0',
          format: 'numeric',
          attributes: {
            'data-sort-value': '0',
          },
        },
      ],
    ])
  })
})
