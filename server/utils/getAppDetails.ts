import { App } from '../@types/managingAppsApi'
import PersonalRelationshipsService from '../services/personalRelationshipsService'
import getFormattedRelationshipDropdown from './formatters/getFormattedRelationshipDropdown'
import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../constants/personalRelationshipsGroupCodes'

import { AppTypeData } from './getAppTypeLogDetails'

type AddNewOfficialContactRequest = Partial<Extract<AppTypeData, { type: 1 }>>
type RemoveContactRequest = Partial<Extract<AppTypeData, { type: 3 }>>

export default async function getApplicationDetails(
  applicationDetails: AppTypeData,
  personalRelationshipsService: PersonalRelationshipsService,
  application?: App,
  earlyDaysCentre?: string,
  isGeneric = false,
): Promise<Record<string, unknown>> {
  if (!applicationDetails || isGeneric || !('type' in applicationDetails)) {
    const details =
      (applicationDetails as { details?: string })?.details?.trim() || application?.requests?.[0]?.details || ''
    return { details }
  }

  const isValid = (value: unknown): boolean =>
    value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')

  const getFallbackValue = <FormType, RequestType, K extends keyof FormType & keyof RequestType>(
    field: K,
    form: FormType,
    request: RequestType,
    defaultValue: FormType[K],
  ): FormType[K] | RequestType[K] => {
    const formValue = form[field]
    const requestValue = request[field]

    if (isValid(formValue)) return formValue
    if (isValid(requestValue)) return requestValue
    return defaultValue
  }

  switch (applicationDetails.type) {
    case 1: {
      const request = (application?.requests?.[0] as AddNewOfficialContactRequest) ?? {}
      const requestWithCompany = request as AddNewOfficialContactRequest & { company?: string }
      const applicationDetailsWithCompany = applicationDetails as AddNewOfficialContactRequest & { company?: string }

      const prefilledDetails: AddNewOfficialContactRequest = {
        firstName: getFallbackValue('firstName', applicationDetails, request, ''),
        lastName: getFallbackValue('lastName', applicationDetails, request, ''),
        organisation:
          getFallbackValue('organisation', applicationDetailsWithCompany, requestWithCompany, '') ||
          getFallbackValue('company', applicationDetailsWithCompany, requestWithCompany, ''),
        relationship: getFallbackValue('relationship', applicationDetails, request, ''),
        telephone1: getFallbackValue('telephone1', applicationDetails, request, ''),
        telephone2: getFallbackValue('telephone2', applicationDetails, request, ''),
      }

      return handleAddNewOfficialContact(prefilledDetails, personalRelationshipsService)
    }

    case 3: {
      const request = (application?.requests?.[0] as RemoveContactRequest) ?? {}

      const prefilledDetails = {
        firstName: getFallbackValue('firstName', applicationDetails, request, ''),
        lastName: getFallbackValue('lastName', applicationDetails, request, ''),
        telephone1: getFallbackValue('telephone1', applicationDetails, request, ''),
        telephone2: getFallbackValue('telephone2', applicationDetails, request, ''),
        relationship: getFallbackValue('relationship', applicationDetails, request, ''),
      }

      return prefilledDetails
    }
    case 5: {
      const { amount, reason } = application?.requests?.[0] ?? {}
      return {
        amount: applicationDetails.amount || String(amount ?? ''),
        reason: applicationDetails.reason || reason || '',
      }
    }
    case 4:
    case 7:
    case 6: {
      const { details } = application?.requests?.[0] ?? {}
      return {
        details: applicationDetails.details || details || '',
      }
    }

    default:
      return {}
  }
}

async function handleAddNewOfficialContact(
  details: AddNewOfficialContactRequest,
  personalRelationshipsService: PersonalRelationshipsService,
): Promise<Record<string, unknown>> {
  const { firstName, lastName, organisation, relationship, telephone1, telephone2 } = details

  return {
    firstName,
    lastName,
    organisation,
    relationship,
    telephone1,
    telephone2,
    formattedRelationshipList: await getFormattedRelationshipDropdown(
      personalRelationshipsService,
      relationship,
      PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP,
    ),
  }
}
