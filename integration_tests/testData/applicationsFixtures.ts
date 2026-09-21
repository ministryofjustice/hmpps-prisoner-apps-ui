import type { PrisonerAppsPage, ViewAppListDto } from '../../server/@types/managingAppsApi'

const toPrisonerAppsPage = (apps: ViewAppListDto[]): PrisonerAppsPage => ({
  page: 1,
  totalRecords: apps.length,
  exhausted: true,
  apps,
})

const buildApplicationsStatusFixtures = (): {
  openApps: PrisonerAppsPage
  closedApps: PrisonerAppsPage
} => {
  const openApps = toPrisonerAppsPage([
    {
      id: 'open-new-1',
      prisonerId: 'A1234BC',
      applicationType: 'Add an official PIN phone contact',
      createdDate: '2026-01-10T10:30:00Z',
      lastUpdatedDate: '2026-01-11T12:00:00Z',
      status: 'NEW',
      messageCount: 2,
    },
    {
      id: 'open-in-progress-1',
      prisonerId: 'A1234BC',
      applicationType: 'Make a general PIN phone enquiry',
      createdDate: '2026-01-12T10:30:00Z',
      lastUpdatedDate: '2026-01-13T12:00:00Z',
      status: 'IN_PROGRESS',
      messageCount: 5,
    },
    {
      id: 'open-new-2',
      prisonerId: 'A1234BC',
      applicationType: 'Supply list of contacts',
      createdDate: '2026-01-13T10:30:00Z',
      lastUpdatedDate: '2026-01-13T12:00:00Z',
      status: 'NEW',
      messageCount: 0,
    },
    {
      id: 'open-in-progress-2',
      prisonerId: 'A1234BC',
      applicationType: 'See chaplaincy',
      createdDate: '2026-01-14T10:30:00Z',
      lastUpdatedDate: '2026-01-14T12:00:00Z',
      status: 'IN_PROGRESS',
    },
  ])

  const closedApps = toPrisonerAppsPage([
    {
      id: 'closed-approved-1',
      prisonerId: 'A1234BC',
      applicationType: 'Add emergency phone credit',
      createdDate: '2026-01-10T10:30:00Z',
      lastUpdatedDate: '2026-01-15T12:00:00Z',
      status: 'APPROVED',
      messageCount: 4,
    },
    {
      id: 'closed-rejected-1',
      prisonerId: 'A1234BC',
      applicationType: 'Add a social PIN phone contact',
      createdDate: '2026-01-14T10:30:00Z',
      lastUpdatedDate: '2026-01-16T12:00:00Z',
      status: 'REJECTED',
    },
    {
      id: 'closed-declined-1',
      prisonerId: 'A1234BC',
      applicationType: 'See chaplaincy',
      createdDate: '2026-01-12T10:30:00Z',
      lastUpdatedDate: '2026-01-13T12:00:00Z',
      status: 'DECLINED',
    },
  ])

  return { openApps, closedApps }
}

export default buildApplicationsStatusFixtures
