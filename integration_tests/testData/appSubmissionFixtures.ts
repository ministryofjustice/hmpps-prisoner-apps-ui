import type { components } from '../../server/@types/managing-prisoner-apps-api'

export const gymBookingAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 101,
  name: 'Gym booking',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

const gymCoursesAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 102,
  name: 'Gym courses',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

const gymNewStarterAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 103,
  name: 'Gym new starter',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

const gymGeneralEnquiryAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 104,
  name: 'Gym (general enquiry)',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const gymAppTypes = [gymBookingAppType, gymCoursesAppType, gymNewStarterAppType, gymGeneralEnquiryAppType]

export const gymGroups: components['schemas']['ApplicationGroupResponse'][] = [
  {
    id: 10,
    name: 'Gym',
    appTypes: gymAppTypes,
  },
]
