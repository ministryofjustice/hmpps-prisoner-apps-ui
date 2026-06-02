import type { AppMessages } from '../../@types/managingAppsApi'

export type MessageItem = {
  text: string
  type: 'sent' | 'received'
  timestamp: string
  sender: string
}

type CreatedByRecord = {
  username?: string
  userId?: string
  displayName?: string
  name?: string
  authSource?: string
  category?: string
  type?: string
}

function normalise(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function isPrisonerAuthoredComment(createdBy: unknown, username: string, userId: string): boolean {
  const prisonerIdentifiers = new Set([normalise(username), normalise(userId), 'prisoner', 'prisoner-auth'])

  if (typeof createdBy === 'string') {
    return prisonerIdentifiers.has(normalise(createdBy))
  }

  if (!createdBy || typeof createdBy !== 'object') {
    return false
  }

  const createdByRecord = createdBy as CreatedByRecord
  const createdByValues = [
    createdByRecord.username,
    createdByRecord.userId,
    createdByRecord.category || createdByRecord.type,
    createdByRecord.authSource,
  ]

  return createdByValues.map(normalise).some(value => prisonerIdentifiers.has(value))
}

export function getSenderLabel(createdBy: unknown): string {
  if (typeof createdBy === 'string') {
    return createdBy || 'Prison staff'
  }

  if (createdBy && typeof createdBy === 'object') {
    const createdByRecord = createdBy as CreatedByRecord
    return createdByRecord.displayName || createdByRecord.name || createdByRecord.username || 'Prison staff'
  }

  return 'Prison staff'
}

export function formatMessages(
  messages: AppMessages | undefined,
  username: string,
  userId: string,
  prisonerDisplayName: string,
  staffDisplayName?: string,
): MessageItem[] {
  const contents = messages?.contents ?? []
  return [...contents]
    .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())
    .map(comment => {
      const isSentByPrisoner = isPrisonerAuthoredComment(comment.createdBy, username, userId)
      let sender = getSenderLabel(comment.createdBy)
      if (staffDisplayName) {
        sender = `${staffDisplayName} staff`
      }
      if (isSentByPrisoner) {
        sender = prisonerDisplayName
      }
      return {
        text: comment.message,
        type: isSentByPrisoner ? 'sent' : 'received',
        timestamp: comment.createdDate,
        sender,
      }
    })
}
