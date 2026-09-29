import { format, getTime } from 'date-fns'
import type { ViewAppListDto } from '../../@types/managingAppsApi'
import { APPLICATION_STATUS_TAG_MAP } from '../../constants/applicationStatus'
import { APPLICATION_TABS, type ApplicationTab } from '../../constants/applicationTabs'

// eslint-disable-next-line import/prefer-default-export
export const formatAppsToRows = (apps: ViewAppListDto[], tab: ApplicationTab = APPLICATION_TABS.OPEN) => {
  return apps.map(({ id, applicationType, createdDate, lastUpdatedDate, status, messageCount, hasUnreadMessages }) => {
    const date = new Date(tab === APPLICATION_TABS.CLOSED ? lastUpdatedDate : createdDate)

    const formattedDate = format(date, 'd MMMM yyyy')
    const sortValue = getTime(date).toString()
    const messages = messageCount ?? 0

    const messagesCell = {
      ...(hasUnreadMessages
        ? {
            html: `<span class="moj-notification-badge"><span aria-hidden="true">${messages}</span><span class="govuk-visually-hidden">(${messages} unread messages)</span></span>`,
          }
        : { text: String(messages) }),
      attributes: { 'data-sort-value': String(messages) },
    }

    return [
      {
        html: `<a href="/applications/${encodeURIComponent(id)}" class="govuk-link">${applicationType}</a>`,
      },
      {
        text: formattedDate,
        attributes: { 'data-sort-value': sortValue },
        classes: 'govuk-!-text-nowrap',
      },
      { html: APPLICATION_STATUS_TAG_MAP[status]?.html ?? status },
      messagesCell,
    ]
  })
}
