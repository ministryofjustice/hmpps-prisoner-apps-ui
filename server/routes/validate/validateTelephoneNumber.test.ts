import { validatePhoneNumber, sanitisePhoneNumber } from './validateTelephoneNumber'

describe('validatePhoneNumber', () => {
  describe('valid phone numbers', () => {
    it('should validate UK phone number', () => {
      const result = validatePhoneNumber('0203 000 0000')
      expect(result).toBe('valid')
    })

    it('should validate UK number with parentheses', () => {
      const result = validatePhoneNumber('(020) 3000 0000')
      expect(result).toBe('valid')
    })

    it('should validate international format', () => {
      const result = validatePhoneNumber('+44 20 3000 0000')
      expect(result).toBe('valid')
    })

    it('should validate number with extension', () => {
      const result = validatePhoneNumber('0203 000 0000 ext. 123')
      expect(result).toBe('valid')
    })

    it('should validate number with parenthetical extension', () => {
      const result = validatePhoneNumber('0203 000 0000 (456)')
      expect(result).toBe('valid')
    })

    it('should validate 00 prefix international', () => {
      const result = validatePhoneNumber('00 44 203 000 0000')
      expect(result).toBe('valid')
    })
  })

  describe('invalid phone numbers', () => {
    it('should reject empty string', () => {
      const result = validatePhoneNumber('')
      expect(result).toBe('invalid_format')
    })

    it('should reject too few digits', () => {
      const result = validatePhoneNumber('020 300')
      expect(result).toBe('invalid_format')
    })

    it('should reject too many digits', () => {
      const result = validatePhoneNumber('020 3000 0000 0000 0000')
      expect(result).toBe('invalid_format')
    })

    it('should reject numbers with letters', () => {
      const result = validatePhoneNumber('0203 ABC 0000')
      expect(result).toBe('invalid_format')
    })

    it('should reject invalid format', () => {
      const result = validatePhoneNumber('not a number')
      expect(result).toBe('invalid_format')
    })

    it('should reject invalid UK number', () => {
      const result = validatePhoneNumber('0113 960 6524')
      expect(result).toBe('invalid_number')
    })
  })

  describe('sanitisePhoneNumber', () => {
    it('should extract main number and extension', () => {
      const result = sanitisePhoneNumber('0203 000 0000 ext. 123')

      expect(result?.mainNumber).toBeDefined()
      expect(result?.extension).toBe('123')
    })

    it('should handle no extension', () => {
      const result = sanitisePhoneNumber('0203 000 0000')

      expect(result?.mainNumber).toBeDefined()
      expect(result?.extension).toBeNull()
    })

    it('should reject null input', () => {
      const result = sanitisePhoneNumber('')

      expect(result).toBeNull()
    })

    it('should strip whitespace', () => {
      const result = sanitisePhoneNumber('  0203 000 0000  ')

      expect(result).not.toBeNull()
      expect(result?.mainNumber).toBeDefined()
    })

    it('should handle parenthetical extension', () => {
      const result = sanitisePhoneNumber('0203 000 0000 (789)')

      expect(result?.extension).toBe('789')
    })

    it('should reject numbers with letters in main number', () => {
      const result = sanitisePhoneNumber('020A 000 0000')

      expect(result).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle multiple spaces', () => {
      const result = validatePhoneNumber('0203    000    0000')
      expect(result).toBe('valid')
    })

    it('should handle plus sign prefix', () => {
      const result = validatePhoneNumber('+44(0)20 3000 0000')
      expect(result).toBe('valid')
    })

    it('should reject extension without main number', () => {
      const result = validatePhoneNumber('ext. 123')
      expect(result).toBe('invalid_format')
    })

    it('should handle extension with x prefix', () => {
      const result = validatePhoneNumber('0203 000 0000 x456')
      expect(result).toBe('valid')
    })

    it('should reject very long extension', () => {
      const result = validatePhoneNumber('0203 000 0000 ext. 12345678')
      expect(result).toBe('invalid_format')
    })
  })
})
