import type { PrisonerAppsPage, ViewAppListDto, ApplicationGroup } from '../../@types/managingAppsApi'

const baseApp: Omit<ViewAppListDto, 'status'> = {
  id: '1',
  prisonerId: 'A1234BC',
  applicationType: 'Add an official PIN phone contact',
  createdDate: '2024-01-10T10:30:00Z',
  lastUpdatedDate: '2024-01-11T12:00:00Z',
}

const toAppsPage = (apps: ViewAppListDto[]): PrisonerAppsPage => ({
  page: 1,
  totalRecords: apps.length,
  exhausted: true,
  apps,
})

export const prisonerApp: ViewAppListDto = { ...baseApp, status: 'NEW' }

export const prisonerAppsResponse: ViewAppListDto[] = [prisonerApp]

export const prisonerAppsPageResponse: PrisonerAppsPage = toAppsPage(prisonerAppsResponse)

export const prisonerClosedApp: ViewAppListDto = { ...baseApp, status: 'APPROVED' }

export const prisonerClosedAppsResponse: ViewAppListDto[] = [prisonerClosedApp]

export const prisonerClosedAppsPageResponse: PrisonerAppsPage = toAppsPage(prisonerClosedAppsResponse)

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
  status: 'NEW',
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

export const appTypePendingResponse = {
  id: 1,
  name: 'Add emergency phone credit',
  genericType: false,
  genericForm: false,
  logDetailRequired: true,
  totalAppsInPending: 0,
  latestAppSubmittedDate: '2026-06-25T14:59:15Z',
  submittedBy: 'PRISONER',
}
