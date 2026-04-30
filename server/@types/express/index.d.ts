import { LaunchpadHeaderLocals, LaunchpadFooterLocals } from '@ministryofjustice/hmpps-prisoner-facing-components'
import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    applicationData?: ApplicationData
  }

  interface ApplicationData {
    additionalData?: AdditionalApplicationData
    applicationId?: string
    date?: string
    earlyDaysCentre?: string
    prisonerId?: string
    prisonerName?: string
    group?: {
      name: string
      value: string
    }
    type?: {
      key: string
      name: string
      value: string
      genericType?: boolean
      genericForm?: boolean
      legacyKey?: string
    }
  }

  type AdditionalApplicationData =
    | SwapVOsForPinCreditDetails
    | AddEmergencyPinPhoneCreditDetails
    | SupplyListOfPinPhoneContactsDetails
    | AddNewSocialPinPhoneContactDetails
    | AddNewOfficialPinPhoneContactDetails
    | RemovePinPhoneContactDetails
    | GeneralPinPhoneEnquiryDetails
    | GenericLogDetails

  interface SwapVOsForPinCreditDetails {
    details?: string
  }
  interface AddEmergencyPinPhoneCreditDetails {
    amount?: string
    reason?: string
  }

  interface SupplyListOfPinPhoneContactsDetails {
    details?: string
  }

  interface GeneralPinPhoneEnquiryDetails {
    details: string
  }

  interface GenericLogDetails {
    details: string
  }

  interface AddNewSocialPinPhoneContactDetails {
    earlyDaysCentre: string
    firstName: string
    lastName: string
    dateOfBirthOrAge: 'dateofbirth' | 'age' | 'donotknow'
    dob?: {
      day: string
      month: string
      year: string
    }
    age?: string
    relationship: string
    addressLine1?: string
    addressLine2?: string
    townOrCity?: string
    postcode?: string
    country?: string
    telephone1: string
    telephone2?: string
  }

  interface AddNewOfficialPinPhoneContactDetails {
    firstName: string
    lastName: string
    organisation?: string
    relationship: string
    telephone1: string
    telephone2?: string
  }

  interface RemovePinPhoneContactDetails {
    firstName: string
    lastName: string
    telephone1: string
    telephone2?: string
    relationship?: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Locals extends LaunchpadHeaderLocals, LaunchpadFooterLocals {
      user: HmppsUser
    }
  }
}
