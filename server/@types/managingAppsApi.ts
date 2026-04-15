import { components } from './managing-prisoner-apps-api'

export type ViewAppListDto = components['schemas']['AppListPrisonerFacing']

export interface ViewAppsForPrisonerDto {
  prisonerUserId: string
  apps: ViewAppListDto
}
