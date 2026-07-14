import { validateTextField } from './validateTextField'

describe('validateTextField', () => {
  describe('required field validation', () => {
    it('should return error when required field is empty', () => {
      const errors = validateTextField({ fieldValue: '', fieldName: 'Messages', isRequired: true })

      expect(errors).toEqual({
        Messages: { text: 'Add a message' },
      })
    })

    it('should return error when required field is only whitespace', () => {
      const errors = validateTextField({ fieldValue: '   ', fieldName: 'Reason', isRequired: true })

      expect(errors).toEqual({})
    })

    it('should return error for Details field when empty and required', () => {
      const errors = validateTextField({ fieldValue: '', fieldName: 'Details', isRequired: true })

      expect(errors).toEqual({
        Details: { text: 'Add details' },
      })
    })

    it('should return error for Reason field when empty and required', () => {
      const errors = validateTextField({ fieldValue: '', fieldName: 'Reason', isRequired: true })

      expect(errors).toEqual({
        Reason: { text: 'Add a reason' },
      })
    })
  })

  describe('optional field validation', () => {
    it('should not return error for empty optional field', () => {
      const errors = validateTextField({ fieldValue: '', fieldName: 'Messages', isRequired: false })

      expect(errors).toEqual({})
    })

    it('should not return error when isRequired is not specified', () => {
      const errors = validateTextField({ fieldValue: '', fieldName: 'Messages' })

      expect(errors).toEqual({})
    })
  })

  describe('character limit validation', () => {
    it('should return error when field exceeds 500 characters', () => {
      const longText = 'a'.repeat(501)
      const errors = validateTextField({
        fieldValue: longText,
        fieldName: 'Messages',
        isRequired: false,
      })

      expect(errors).toEqual({
        Messages: { text: 'Messages must be 500 characters or less' },
      })
    })

    it('should not return error when field is exactly 500 characters', () => {
      const text = 'a'.repeat(500)
      const errors = validateTextField({
        fieldValue: text,
        fieldName: 'Messages',
        isRequired: false,
      })

      expect(errors).toEqual({})
    })

    it('should not return error when field is under 500 characters', () => {
      const text = 'a'.repeat(250)
      const errors = validateTextField({
        fieldValue: text,
        fieldName: 'Reason',
        isRequired: false,
      })

      expect(errors).toEqual({})
    })

    it('should return character limit error for Reason field', () => {
      const longText = 'x'.repeat(501)
      const errors = validateTextField({
        fieldValue: longText,
        fieldName: 'Reason',
        isRequired: false,
      })

      expect(errors).toEqual({
        Reason: { text: 'Reason must be 500 characters or less' },
      })
    })
  })

  describe('edge cases', () => {
    it('should handle single character text', () => {
      const errors = validateTextField({ fieldValue: 'a', fieldName: 'Messages', isRequired: true })

      expect(errors).toEqual({})
    })

    it('should handle text with special characters', () => {
      const text = 'Hello, World! @#$%^&*()'
      const errors = validateTextField({ fieldValue: text, fieldName: 'Details', isRequired: true })

      expect(errors).toEqual({})
    })

    it('should handle text with newlines', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const errors = validateTextField({ fieldValue: text, fieldName: 'Messages', isRequired: false })

      expect(errors).toEqual({})
    })

    it('should prioritize required error over character limit', () => {
      const errors = validateTextField({ fieldValue: '', fieldName: 'Messages', isRequired: true })

      expect(errors).toEqual({
        Messages: { text: 'Add a message' },
      })
      expect(Object.keys(errors)).toHaveLength(1)
    })
  })
})
