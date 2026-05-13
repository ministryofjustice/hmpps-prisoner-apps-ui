import type { PrisonerAppsPage, ViewAppListDto, ApplicationGroup } from '../../@types/managingAppsApi'

export const prisonerApp: ViewAppListDto = {
  id: '1',
  prisonerId: 'A1234BC',
  applicationType: 'Add an official PIN phone contact',
  createdDate: '2024-01-10T10:30:00Z',
  lastUpdatedDate: '2024-01-11T12:00:00Z',
  status: 'PENDING',
}

export const prisonerAppsResponse: ViewAppListDto[] = [prisonerApp]

export const prisonerAppsPageResponse: PrisonerAppsPage = {
  page: 1,
  totalRecords: prisonerAppsResponse.length,
  exhausted: true,
  apps: prisonerAppsResponse,
}

export const applicationTypeResponse: ApplicationGroup = {
  id: 1,
  name: 'Add an official PIN phone contact',
  appTypes: [
    {
      id: 1,
      name: 'string',
      genericType: true,
      genericForm: true,
      logDetailRequired: true,
      count: 0,
    },
  ],
}

export const viewAppResponse = {
  id: '1',
  createdDate: '2024-01-10T10:30:00Z',
  status: 'PENDING',
  genericForm: true,
  applicationType: {
    id: 7,
    name: 'Make a general PIN phone enquiry',
  },
  requests: [
    {
      details: 'Testing general PIN phone enquiry',
    },
  ],
}
