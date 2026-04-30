import { components } from './managing-prisoner-apps-api'

export type ApplicationDto = components['schemas']['AppResponseDtoObjectObject']
export type AssignedGroup = components['schemas']['AssignedGroupDto']

export type ViewAppListDto = components['schemas']['AppListPrisonerFacing']
export type PrisonerAppsPage = components['schemas']['PrisonerAppsPage']
export type ApplicationGroup = components['schemas']['ApplicationGroupResponse']
export type AppResponsePrisoner = components['schemas']['AppResponsePrisonerObjectObject']
export type AppRequestPrisoner = components['schemas']['AppRequestPrisoner']

export interface App extends ApplicationDto {
  applicationType: {
    id: number
    name: string
  }
  assignedGroup: AssignedGroup
  requestedBy: AppRequestedBy
  requests: AppRequest[]
}

export interface AppRequest {
  id: string
  responseId: string
  amount?: number
  reason?: string
  details?: string
  [key: string]: unknown
}

export interface AppRequestedBy {
  username: string
  userId: string
  firstName: string
  lastName: string
  category: string
  cellLocation: string
  location: string
  iep: string
}

export interface ApplicationType {
  id: number
  name: string
  genericType?: boolean
  genericForm?: boolean
  logDetailRequired?: boolean
  count?: number
}

export interface Group {
  id: number
  name: string
  appTypes: ApplicationType[]
}
