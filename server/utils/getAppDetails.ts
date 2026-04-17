import { App } from '../@types/managingAppsApi'
import { AppTypeData } from './getAppTypeLogDetails'

export default async function getApplicationDetails(
  applicationDetails: AppTypeData,
  application?: App,
  earlyDaysCentre?: string,
  isGeneric = false,
): Promise<Record<string, unknown>> {
  if (!applicationDetails || isGeneric || !('type' in applicationDetails)) {
    const details =
      (applicationDetails as { details?: string })?.details?.trim() || application?.requests?.[0]?.details || ''
    return { details }
  }

  switch (applicationDetails.type) {
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
