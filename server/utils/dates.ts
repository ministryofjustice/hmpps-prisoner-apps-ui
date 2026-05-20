// eslint-disable-next-line import/prefer-default-export
export function toLocalTimestamp(utcIsoString: string): string {
  const date = new Date(utcIsoString)
  const offsetMs = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type === 'timeZoneName') {
        // e.g. "GMT+1" → +60 mins, "GMT" → 0
        const match = part.value.match(/GMT([+-]\d+)?/)
        return match ? parseInt(match[1] ?? '0', 10) * 60 * 60 * 1000 : 0
      }
      return acc
    }, 0)
  return new Date(date.getTime() + offsetMs).toISOString().replace('Z', '+00:00')
}
