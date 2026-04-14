import { format, getTime } from 'date-fns'
import type { ViewAppListDto } from '../../@types/managingAppsApi'

// eslint-disable-next-line import/prefer-default-export
export const formatAppsToRows = (apps: ViewAppListDto[]) => {
  return apps.map(({ prisonerId, applicationType, createdDate, status }) => {
    const date = new Date(createdDate)

    const formattedDate = format(date, 'dd/MM/yyyy')
    const sortValue = getTime(date).toString()

    return [
      {
        text: formattedDate,
        attributes: { 'data-sort-value': sortValue },
        classes: 'govuk-!-text-nowrap',
      },
      { text: applicationType },
      { text: status },
      {
        html: `<a href="/applications/${prisonerId}" class="govuk-link">View</a>`,
      },
    ]
  })
}
