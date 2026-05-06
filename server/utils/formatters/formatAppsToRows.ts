import { format, getTime } from 'date-fns'
import type { ViewAppListDto } from '../../@types/managingAppsApi'
import { APPLICATION_STATUS_TAG_MAP } from '../../constants/applicationStatus'

// eslint-disable-next-line import/prefer-default-export
export const formatAppsToRows = (apps: ViewAppListDto[]) => {
  return apps.map(({ id, applicationType, createdDate, status }) => {
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
      { html: APPLICATION_STATUS_TAG_MAP[status]?.html ?? status },
      {
        html: `<a href="/applications/${encodeURIComponent(id)}" class="govuk-link">View</a>`,
      },
    ]
  })
}
