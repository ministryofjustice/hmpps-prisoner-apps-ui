import { format, getTime } from 'date-fns'
import type { ViewAppListDto } from '../../@types/managingAppsApi'

const statusTagMap: Record<ViewAppListDto['status'], string> = {
  PENDING: '<strong class="govuk-tag govuk-tag--yellow">Pending</strong>',
  DECLINED: '<strong class="govuk-tag govuk-tag--red">Declined</strong>',
  APPROVED: '<strong class="govuk-tag govuk-tag--green">Approved</strong>',
}

const getStatusTagHtml = (status: ViewAppListDto['status']) => statusTagMap[status]

// eslint-disable-next-line import/prefer-default-export
export const formatAppsToRows = (apps: ViewAppListDto[]) => {
  return apps.map(({ applicationType, createdDate, status }) => {
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
      { html: getStatusTagHtml(status) },
      {
        html: `<a href="/applications/" class="govuk-link">View</a>`,
      },
    ]
  })
}
