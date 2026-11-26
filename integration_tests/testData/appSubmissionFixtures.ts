import type { components } from '../../server/@types/managing-prisoner-apps-api'

const genericFormAppType = (
  id: number,
  name: string,
  genericType = false,
): components['schemas']['ApplicationTypeResponse'] => ({
  id,
  name,
  genericType,
  genericForm: true,
  logDetailRequired: true,
})

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

export const moneyGeneralEnquiryAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 201,
  name: 'Money (general enquiry)',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const moneyGroups: components['schemas']['ApplicationGroupResponse'][] = [
  {
    id: 11,
    name: 'Money',
    appTypes: [moneyGeneralEnquiryAppType],
  },
]

export const incentivesAppealAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 301,
  name: 'Appeal an incentives decision',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const incentivesStatusIncreaseAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 302,
  name: 'Apply for status increase',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const incentivesGeneralEnquiryAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 303,
  name: 'Incentives (general enquiry)',
  genericType: true,
  genericForm: true,
  logDetailRequired: true,
}

export const incentivesAppTypes = [
  incentivesAppealAppType,
  incentivesStatusIncreaseAppType,
  incentivesGeneralEnquiryAppType,
]

export const incentivesGroups: components['schemas']['ApplicationGroupResponse'][] = [
  {
    id: 12,
    name: 'Incentives (IEP)',
    appTypes: incentivesAppTypes,
  },
]

export const educationCourseAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 401,
  name: 'Apply for education course',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const prisonJobAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 402,
  name: 'Apply for prison job',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const careersAdviceAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 403,
  name: 'Careers Information, Advice, and Guidance (CIAG)',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const activityHubAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 404,
  name: 'Contact Activity Hub staff',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const educationStaffAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 405,
  name: 'Contact education staff',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const dukeOfEdinburghAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 406,
  name: 'Duke of Edinburgh Award',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const samaritansListenerAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 407,
  name: "Samaritans' Listener",
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const shannonTrustAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 408,
  name: 'Shannon Trust request',
  genericType: false,
  genericForm: true,
  logDetailRequired: true,
}

export const educationGeneralEnquiryAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 409,
  name: 'Education (general enquiry)',
  genericType: true,
  genericForm: true,
  logDetailRequired: true,
}

export const jobsCoursesGeneralEnquiryAppType: components['schemas']['ApplicationTypeResponse'] = {
  id: 410,
  name: 'Jobs, courses, education, activities (general enquiry)',
  genericType: true,
  genericForm: true,
  logDetailRequired: true,
}

export const jobsCoursesAppTypes = [
  educationCourseAppType,
  prisonJobAppType,
  careersAdviceAppType,
  activityHubAppType,
  educationStaffAppType,
  dukeOfEdinburghAppType,
  samaritansListenerAppType,
  shannonTrustAppType,
  educationGeneralEnquiryAppType,
  jobsCoursesGeneralEnquiryAppType,
]

export const jobsCoursesGroups: components['schemas']['ApplicationGroupResponse'][] = [
  {
    id: 13,
    name: 'Jobs, courses, education and activities',
    appTypes: jobsCoursesAppTypes,
  },
]

export const omuAppTypes = [
  genericFormAppType(501, 'Contact case admin'),
  genericFormAppType(502, 'Contact keyworker'),
  genericFormAppType(503, 'Contact POM'),
  genericFormAppType(504, 'Court question'),
  genericFormAppType(505, 'Equalities questions'),
  genericFormAppType(506, 'Foreign National status'),
  genericFormAppType(507, 'Home Detention Curfew (HDC)'),
  genericFormAppType(508, 'Licence Conditions'),
  genericFormAppType(509, 'Parole'),
  genericFormAppType(510, 'Prisoner to Prisoner Contact'),
  genericFormAppType(511, 'Prison transfer (including on compassionate grounds)'),
  genericFormAppType(512, 'Release date'),
  genericFormAppType(513, 'Update my personal details'),
  genericFormAppType(514, 'OMU (general enquiry)', true),
]

export const omuGeneralEnquiryAppType = omuAppTypes[omuAppTypes.length - 1]

export const omuGroups: components['schemas']['ApplicationGroupResponse'][] = [
  {
    id: 14,
    name: 'Offender Management Unit (OMU)',
    appTypes: omuAppTypes,
  },
]

export const resettlementAppTypes = [
  genericFormAppType(601, 'Cell move'),
  genericFormAppType(602, 'Contact RECONNECT (NHS)'),
  genericFormAppType(603, 'Contact resettlement practitioner'),
  genericFormAppType(604, 'Contact Stepping Stones'),
  genericFormAppType(605, 'Contact Through the Gate charity'),
  genericFormAppType(606, 'Discharge grant'),
  genericFormAppType(607, 'Employment'),
  genericFormAppType(608, 'Housing'),
  genericFormAppType(609, 'ID or banking'),
  genericFormAppType(610, 'Probation question'),
  genericFormAppType(611, 'Universal Credit (Benefits)'),
  genericFormAppType(612, 'Resettlement (general enquiry)', true),
]

export const resettlementGeneralEnquiryAppType = resettlementAppTypes[resettlementAppTypes.length - 1]

export const resettlementGroups: components['schemas']['ApplicationGroupResponse'][] = [
  {
    id: 15,
    name: 'Resettlement',
    appTypes: resettlementAppTypes,
  },
]

export const genericApplicationScenarios = [
  {
    groupName: 'Money',
    groups: moneyGroups,
    appType: moneyGeneralEnquiryAppType,
    appTypes: [moneyGeneralEnquiryAppType],
    details: 'Please provide an update about my money application.',
  },
  {
    groupName: 'Incentives (IEP)',
    groups: incentivesGroups,
    appType: incentivesAppealAppType,
    appTypes: incentivesAppTypes,
    details: 'Please review my incentives status appeal.',
  },
  {
    groupName: 'Jobs, courses, education and activities',
    groups: jobsCoursesGroups,
    appType: educationCourseAppType,
    appTypes: jobsCoursesAppTypes,
    details: 'Please consider my application for an education course.',
  },
  {
    groupName: 'Offender Management Unit (OMU)',
    groups: omuGroups,
    appType: omuGeneralEnquiryAppType,
    appTypes: omuAppTypes,
    details: 'Please provide an update about my case.',
  },
  {
    groupName: 'Resettlement',
    groups: resettlementGroups,
    appType: resettlementGeneralEnquiryAppType,
    appTypes: resettlementAppTypes,
    details: 'Please provide an update about my resettlement support.',
  },
]
