import { format } from 'date-fns'

import { Request, Response, Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import ManagingAppsService from '../../services/managingAppsService'

import { URLS } from '../../constants/urls'
import { PATHS } from '../../constants/paths'
import { APPLICATION_STATUS_TAG_MAP } from '../../constants/applicationStatus'

import { getPaginationData } from '../../utils/http/pagination'
import { formatAppsToRows } from '../../utils/formatters/formatAppsToRows'
import { formatGivenName, hasGivenName } from '../../utils/formatters/formatName'
import { validateTextField } from '../validate/validateTextField'
import type { AppMessages } from '../../@types/managingAppsApi'
import { type MessageItem, formatMessages } from '../../utils/formatters/formatMessages'

const ITEMS_PER_PAGE = 10
const MESSAGES_PAGE_SIZE = 50
const MESSAGE_VISIBILITY_PRISONER = 'STAFF_AND_PRISONER'

function getStaffDisplayName(res: Response): string | undefined {
  const { user } = res.locals
  if (user.authSource === 'prisoner-auth') {
    return user.establishment?.display_name || user.establishment?.name
  }

  return undefined
}

function getPrisonerDisplayName(res: Response, username: string): string {
  const headerName = res.locals.launchpadHeaderConfig?.user?.name?.trim()
  if (headerName) {
    return headerName
  }

  const { user } = res.locals
  if (user.authSource === 'prisoner-auth') {
    const nameFromParts = [user.familyName, user.givenName].filter(Boolean).join(', ')
    if (nameFromParts) {
      return nameFromParts
    }
  }

  return user.displayName || user.name || username
}

async function resolveLatestMessage(
  managingAppsService: ManagingAppsService,
  userId: string,
  appId: string,
  firstPageResponse: AppMessages,
  username: string,
  prisonerUserId: string,
  prisonerDisplayName: string,
  staffDisplayName?: string,
): Promise<MessageItem | undefined> {
  let pageForLatest = firstPageResponse
  if (!firstPageResponse.exhausted && firstPageResponse.totalElements > MESSAGES_PAGE_SIZE) {
    const lastPageNum = Math.ceil(firstPageResponse.totalElements / MESSAGES_PAGE_SIZE)
    pageForLatest = await managingAppsService.getAppMessages(userId, appId, lastPageNum, MESSAGES_PAGE_SIZE)
  }
  const lastPageMessages = formatMessages(
    pageForLatest,
    username,
    prisonerUserId,
    prisonerDisplayName,
    staffDisplayName,
  )
  return lastPageMessages[lastPageMessages.length - 1]
}

export default function viewAppsRouter({
  auditService,
  managingAppsService,
}: {
  auditService: AuditService
  managingAppsService: ManagingAppsService
}): Router {
  const router = Router()

  router.get(URLS.APPLICATIONS, async (req: Request, res: Response) => {
    const { userId } = res.locals.user
    const page = Number(req.query.page) || 1

    const givenName = hasGivenName(res.locals.user) ? res.locals.user.givenName : ''
    const firstName = formatGivenName(givenName)

    await auditService.logPageView(Page.VIEW_APPLICATIONS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const prisonerApps = await managingAppsService.getPrisonerApps(userId, page, ITEMS_PER_PAGE)
    const pagination = getPaginationData(page, prisonerApps.totalRecords, ITEMS_PER_PAGE)
    const rows = formatAppsToRows(prisonerApps.apps)

    res.render(PATHS.APPLICATIONS.LIST, {
      apps: rows,
      pagination,
      firstName,
      query: req.query,
    })
  })

  const renderAppView = async (
    req: Request<{ id: string }>,
    res: Response,
    options: { errors?: Record<string, { text: string }>; replyValue?: string } = {},
  ) => {
    const { userId, username } = res.locals.user
    const givenName = hasGivenName(res.locals.user) ? res.locals.user.givenName : ''
    const firstName = formatGivenName(givenName)
    const prisonerDisplayName = getPrisonerDisplayName(res, username)
    const staffDisplayName = getStaffDisplayName(res)

    const [application, messagesResponse] = await Promise.all([
      managingAppsService.getPrisonerAppById(userId, req.params.id),
      managingAppsService.getAppMessages(userId, req.params.id, 1, MESSAGES_PAGE_SIZE),
    ])

    const { label: statusLabel, className: statusClass } =
      APPLICATION_STATUS_TAG_MAP[application.status] ?? APPLICATION_STATUS_TAG_MAP.PENDING

    const isDecisionMade = application.status === 'APPROVED' || application.status === 'DECLINED'
    const messages = formatMessages(messagesResponse, username, userId, prisonerDisplayName, staffDisplayName)

    const latestMessage = await resolveLatestMessage(
      managingAppsService,
      userId,
      req.params.id,
      messagesResponse,
      username,
      userId,
      prisonerDisplayName,
      staffDisplayName,
    )
    const canSendReply = !isDecisionMade && latestMessage?.type !== 'sent'
    const showAwaitingReplyMessage = !isDecisionMade && !canSendReply

    res.render(PATHS.APPLICATIONS.VIEW, {
      title: application.applicationType.name,
      firstName,
      applicationType: application.applicationType.name
        .replace(/[^\w\s]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-'),
      application: {
        ...application,
        createdDate: format(new Date(application.createdDate), 'd MMMM yyyy'),
      },
      statusLabel,
      statusClass,
      isPending: application.status === 'PENDING',
      isGeneric: application.genericForm,
      isDecisionMade,
      reason: isDecisionMade ? application.reason : null,
      messages,
      canSendReply,
      showAwaitingReplyMessage,
      errors: options.errors ?? {},
      replyValue: options.replyValue ?? '',
    })
  }

  router.get(`${URLS.APPLICATIONS}/:id`, async (req: Request<{ id: string }>, res: Response) => {
    await renderAppView(req, res)
  })

  router.post(`${URLS.APPLICATIONS}/:id`, async (req: Request<{ id: string }>, res: Response) => {
    const { userId, username } = res.locals.user
    const staffDisplayName = getStaffDisplayName(res)
    const { id: appId } = req.params
    const reply = (req.body?.reply ?? '').toString().trim()

    const errors = validateTextField({ fieldValue: reply, fieldName: 'Messages', isRequired: true })

    if (Object.keys(errors).length > 0) {
      await renderAppView(req, res, { errors: { reply: errors.Messages }, replyValue: reply })
      return
    }

    if (req.session.pendingMessageAppId === appId) {
      res.redirect(`${URLS.APPLICATIONS}/${appId}`)
      return
    }

    const messagesResponse = await managingAppsService.getAppMessages(userId, appId, 1, MESSAGES_PAGE_SIZE)
    const latestMessage = await resolveLatestMessage(
      managingAppsService,
      userId,
      appId,
      messagesResponse,
      username,
      userId,
      '',
      staffDisplayName,
    )
    if (latestMessage?.type === 'sent') {
      res.redirect(`${URLS.APPLICATIONS}/${appId}`)
      return
    }

    req.session.pendingMessageAppId = appId
    try {
      await managingAppsService.addAppMessage(userId, appId, reply, MESSAGE_VISIBILITY_PRISONER)
    } finally {
      delete req.session.pendingMessageAppId
    }

    res.redirect(`${URLS.APPLICATIONS}/${appId}`)
  })

  return router
}
