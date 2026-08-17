export const APPLICATION_STATUS_TAG_MAP: Record<string, { label: string; className: string; html: string }> = {
  NEW: {
    label: 'New',
    className: 'govuk-tag--light-blue',
    html: '<strong class="govuk-tag govuk-tag--light-blue">New</strong>',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'govuk-tag--yellow',
    html: '<strong class="govuk-tag govuk-tag--yellow">In progress</strong>',
  },
  APPROVED: {
    label: 'Approved',
    className: 'govuk-tag--green',
    html: '<strong class="govuk-tag govuk-tag--green">Approved</strong>',
  },
  DECLINED: {
    label: 'Declined',
    className: 'govuk-tag--red',
    html: '<strong class="govuk-tag govuk-tag--red">Declined</strong>',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'govuk-tag--purple',
    html: '<strong class="govuk-tag govuk-tag--purple">Rejected</strong>',
  },
}

export const REJECTION_REASON_MAP: Record<string, string> = {
  'Prisoner used the wrong app': 'This app has been rejected because you used the wrong app',
  'Prisoner has already sent this app': 'This app has been rejected because you already sent this app',
  'Prisoner sent an abusive app': 'This app has been rejected because you sent an abusive app',
}
