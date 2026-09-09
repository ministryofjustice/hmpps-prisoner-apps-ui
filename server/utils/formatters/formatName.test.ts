import { formatFullName, formatName, NameFormatStyle } from './formatName'

describe('formatName', () => {
  describe('default style (firstMiddleLast)', () => {
    it.each([
      ['first, middle, and last names', ['JOHN', 'MICHAEL', 'SMITH'], 'John Michael Smith'],
      ['first and last names', ['JOHN', '', 'SMITH'], 'John Smith'],
      ['only first name', ['JOHN', '', ''], 'John'],
      ['lowercase names', ['john', 'michael', 'smith'], 'John Michael Smith'],
      ['mixed case names', ['JoHn', 'MiChAeL', 'SmItH'], 'John Michael Smith'],
      ['hyphenated names', ['MARY-JANE', '', 'SMITH-JONES'], 'Mary-Jane Smith-Jones'],
      ['apostrophe names', ['JOHN', '', "O'BRIEN"], "John O'Brien"],
      ['empty strings', ['', '', 'SMITH'], 'Smith'],
      ['all empty strings', ['', '', ''], ''],
    ])('%s', (_description, [firstName, middleNames, lastName], expected) => {
      expect(formatName(firstName, middleNames, lastName)).toBe(expected)
    })
  })

  describe('lastCommaFirstMiddle style', () => {
    it('formats Last, First Middle', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH', { style: NameFormatStyle.lastCommaFirstMiddle })).toBe(
        'Smith, John Michael',
      )
    })

    it('formats Last, First without a middle name', () => {
      expect(formatName('JOHN', '', 'SMITH', { style: NameFormatStyle.lastCommaFirstMiddle })).toBe('Smith, John')
    })
  })

  describe('lastCommaFirst style', () => {
    it('excludes the middle name', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH', { style: NameFormatStyle.lastCommaFirst })).toBe('Smith, John')
    })
  })

  describe('firstLast style', () => {
    it('excludes the middle name', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH', { style: NameFormatStyle.firstLast })).toBe('John Smith')
    })

    it('handles only a first name', () => {
      expect(formatName('JOHN', '', '', { style: NameFormatStyle.firstLast })).toBe('John')
    })
  })
})

describe('formatFullName', () => {
  it.each([
    ['uppercase name with prefix', '.JOHN DOE', '.John Doe'],
    ['single word name', 'JOHN', 'John'],
    ['apostrophe surname', "JOHN O'BRIEN", "John O'Brien"],
  ])('%s', (_description, input, expected) => {
    expect(formatFullName(input)).toBe(expected)
  })
})
