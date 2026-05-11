enum NameFormatStyle {
  firstMiddleLast,
  lastCommaFirstMiddle,
  lastCommaFirst,
  firstLast,
}

type UserWithGivenName = {
  givenName: string
}

export const formatName = (
  firstName: string,
  middleNames: string,
  lastName: string,
  options?: { style: NameFormatStyle },
): string => {
  const names = [firstName, middleNames, lastName]
  if (options?.style === NameFormatStyle.lastCommaFirstMiddle) {
    names.unshift(`${names.pop()},`)
  } else if (options?.style === NameFormatStyle.lastCommaFirst) {
    names.unshift(`${names.pop()},`)
    names.pop()
  } else if (options?.style === NameFormatStyle.firstLast) {
    names.splice(1, 1)
  }
  return names
    .filter(s => s)
    .map(s => s.toLowerCase())
    .join(' ')
    .replace(/(^\w)|([\s'-]+\w)/g, letter => letter.toUpperCase())
}

export const hasGivenName = (user: unknown): user is UserWithGivenName => {
  return typeof user === 'object' && user !== null && 'givenName' in user && typeof user.givenName === 'string'
}

export const formatGivenName = (givenName: string): string => {
  return formatName(givenName.trim(), '', '').replace(
    /^([^A-Za-z]*)([A-Za-z])/,
    (_match, prefix, letter) => `${prefix}${letter.toUpperCase()}`,
  )
}
