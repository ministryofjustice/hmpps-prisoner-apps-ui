import type { ViewAppListDto } from '../../@types/managingAppsApi'

export const prisonerApp: ViewAppListDto = {
  id: '1',
  prisonerId: 'A1234BC',
  applicationType: 'Add an official PIN phone contact',
  createdDate: '2024-01-10T10:30:00Z',
  lastUpdatedDate: '2024-01-11T12:00:00Z',
  status: 'PENDING',
}

export const prisonerAppsResponse: ViewAppListDto[] = [prisonerApp]
