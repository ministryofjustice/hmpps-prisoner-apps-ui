// eslint-disable-next-line import/prefer-default-export
export const APPLICATION_STATUS_TAG_MAP: Record<string, { label: string; className: string; html: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'govuk-tag--yellow',
    html: '<strong class="govuk-tag govuk-tag--yellow">Pending</strong>',
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
}
