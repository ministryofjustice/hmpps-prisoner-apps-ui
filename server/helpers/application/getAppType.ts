import { HmppsUser } from '../../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../../services/managingAppsService'

// eslint-disable-next-line import/prefer-default-export
export const getAppType = async (
  managingAppsService: ManagingPrisonerAppsService,
  user: HmppsUser,
  appTypeId: string,
) => {
  const groups = await managingAppsService.getGroupsAndTypes(user.userId)
  const allAppTypes = groups.flatMap(group => group.appTypes)
  return allAppTypes.find(type => type.id.toString() === appTypeId)
}
