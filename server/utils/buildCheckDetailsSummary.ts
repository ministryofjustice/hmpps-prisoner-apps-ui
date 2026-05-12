type SummaryRow = {
  key: string
  value: string
}

type DobValue = { day: string; month: string; year: string }

function formatDob(dob: DobValue | undefined): string {
  if (!dob) return ''
  const { day, month, year } = dob
  if (!day && !month && !year) return ''
  return [day, month, year].filter(Boolean).join('/')
}

function row(key: string, value: string | undefined): SummaryRow | null {
  if (!value || value.trim() === '') return null
  return { key, value }
}

function buildDetailsRows(data: Record<string, unknown>): SummaryRow[] {
  return [
    {
      key: 'Details',
      value: (data.details as string) ?? '',
    },
  ] as SummaryRow[]
}

function buildEmergencyCreditRows(data: Record<string, unknown>): SummaryRow[] {
  return [row('Amount', data.amount ? `£${data.amount}` : ''), row('Reason', data.reason as string)].filter(
    Boolean,
  ) as SummaryRow[]
}

function buildOfficialContactRows(data: Record<string, unknown>): SummaryRow[] {
  return [
    row('First name', data.firstName as string),
    row('Last name', data.lastName as string),
    row('Organisation', data.organisation as string),
    row('Relationship', data.relationship as string),
    row('Telephone number', data.telephone1 as string),
    row('Second telephone number', data.telephone2 as string),
  ].filter(Boolean) as SummaryRow[]
}

function buildSocialContactRows(data: Record<string, unknown>): SummaryRow[] {
  const dobValue = data.dob as DobValue | undefined
  const dateOfBirthOrAge = data.dateOfBirthOrAge as string | undefined

  let dobRow: SummaryRow | null = null
  if (dateOfBirthOrAge === 'dateofbirth') {
    dobRow = row('Date of birth', formatDob(dobValue))
  } else if (dateOfBirthOrAge === 'age') {
    dobRow = row('Age', data.age as string)
  }

  return [
    row('First name', data.firstName as string),
    row('Last name', data.lastName as string),
    dobRow,
    row('Relationship', data.relationship as string),
    row('Address line 1', data.addressLine1 as string),
    row('Address line 2', data.addressLine2 as string),
    row('Town or city', data.townOrCity as string),
    row('Postcode', data.postcode as string),
    row('Country', data.country as string),
    row('Telephone number', data.telephone1 as string),
    row('Second telephone number', data.telephone2 as string),
  ].filter(Boolean) as SummaryRow[]
}

function buildRemoveContactRows(data: Record<string, unknown>): SummaryRow[] {
  return [
    row('First name', data.firstName as string),
    row('Last name', data.lastName as string),
    row('Relationship', data.relationship as string),
    row('Telephone number', data.telephone1 as string),
    row('Second telephone number', data.telephone2 as string),
  ].filter(Boolean) as SummaryRow[]
}

// Maps application type IDs to their row-builder functions.
// IDs match the case statements in handleAppDetails.ts:
// 1 = Add emergency PIN phone credit
// 2 = Add new official PIN phone contact
// 3 = Add new social PIN phone contact
// 4 = Remove PIN phone contact
// 5 = Swap visiting orders for PIN credit (details)
// 6 = Supply list of contacts (details)
// 7 = General PIN phone enquiry (details)
const ROW_BUILDERS: Record<number, (data: Record<string, unknown>) => SummaryRow[]> = {
  1: buildEmergencyCreditRows,
  2: buildOfficialContactRows,
  3: buildSocialContactRows,
  4: buildRemoveContactRows,
  5: buildDetailsRows,
  6: buildDetailsRows,
  7: buildDetailsRows,
}

const PIN_PHONE_SUMMARY_LIST_HEADERS: Record<number, string> = {
  1: 'Emergency credit to add',
  2: 'New official contact to add',
  3: 'New social contact to add',
  4: 'PIN phone contact to remove',
  5: 'VOs to swap',
  6: 'Supply contact list',
}

export function getPinPhoneSummaryListHeading(typeId: number | null, isGeneric: boolean): string | undefined {
  if (isGeneric || typeId === null) return undefined

  return PIN_PHONE_SUMMARY_LIST_HEADERS[typeId]
}

export default function buildCheckDetailsSummary(
  typeId: number | null,
  additionalData: Record<string, unknown> | undefined,
  isGeneric: boolean,
): SummaryRow[] {
  const data = additionalData ?? {}

  if (isGeneric || typeId === null) {
    return buildDetailsRows(data)
  }

  const builder = ROW_BUILDERS[typeId] ?? buildDetailsRows
  return builder(data)
}
