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
    ;(format as jest.Mock).mockReturnValue('10/01/2024')

    const applications = [
      {
        id: 'app-1',
        prisonerId: 'A1234BC',
        applicationType: 'Transfer',
        createdDate: '2024-01-10T00:00:00Z',
        lastUpdatedDate: '2024-01-10T00:00:00Z',
        status: 'PENDING' as const,
      },
    ]

    const result = formatAppsToRows(applications)

    expect(result).toEqual([
      [
        {
          text: '10/01/2024',
          attributes: {
            'data-sort-value': '1704844800000',
          },
          classes: 'govuk-!-text-nowrap',
        },
        { text: 'Transfer' },
        { text: 'PENDING' },
        {
          html: '<a href="/applications/A1234BC" class="govuk-link">View</a>',
        },
      ],
    ])
  })
})
