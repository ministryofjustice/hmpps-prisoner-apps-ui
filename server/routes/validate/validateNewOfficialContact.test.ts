import type { AddNewOfficialPinPhoneContactDetails } from 'express-session'
import { validateAddNewOfficialContact } from './validateNewOfficialContact'

describe('validateAddNewOfficialContact', () => {
  describe('name validation', () => {
    it('should return error when firstName is missing', () => {
      const form = {
        firstName: '',
        lastName: 'Smith',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.firstName).toEqual({ text: "Enter the contact's first name" })
    })

    it('should return error when lastName is missing', () => {
      const form = {
        firstName: 'John',
        lastName: '',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.lastName).toEqual({ text: "Enter the contact's last name" })
    })

    it('should return error when firstName is only whitespace', () => {
      const form = {
        firstName: '   ',
        lastName: 'Smith',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.firstName).toEqual({ text: "Enter the contact's first name" })
    })

    it('should return error when lastName is only whitespace', () => {
      const form = {
        firstName: 'John',
        lastName: '   ',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.lastName).toEqual({ text: "Enter the contact's last name" })
    })
  })

  describe('relationship validation', () => {
    it('should return error when relationship is missing', () => {
      const form = {
        firstName: 'John',
        lastName: 'Smith',
        relationship: '',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.relationship).toEqual({ text: 'Select a relationship' })
    })

    it('should accept valid relationship value', () => {
      const form = {
        firstName: 'John',
        lastName: 'Smith',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.relationship).toBeUndefined()
    })
  })

  describe('phone validation', () => {
    it('should accept valid primary phone', () => {
      const form = {
        firstName: 'John',
        lastName: 'Smith',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.telephone1).toBeUndefined()
    })

    it('should accept valid secondary phone', () => {
      const form = {
        firstName: 'John',
        lastName: 'Smith',
        relationship: '1',
        telephone1: '0203 000 0000',
        telephone2: '0203 000 0001',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.telephone2).toBeUndefined()
    })

    it('should allow missing optional secondary phone', () => {
      const form = {
        firstName: 'John',
        lastName: 'Smith',
        relationship: '1',
        telephone1: '0203 000 0000',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.telephone2).toBeUndefined()
    })
  })

  describe('complete form validation', () => {
    it('should accept valid complete form', () => {
      const form = {
        firstName: 'Jane',
        lastName: 'Doe',
        relationship: '2',
        telephone1: '0203 000 0000',
        telephone2: '0203 000 0001',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('should return all errors when form is empty', () => {
      const form = {} as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.firstName).toBeDefined()
      expect(errors.lastName).toBeDefined()
      expect(errors.relationship).toBeDefined()
      expect(errors.telephone1).toBeDefined()
    })

    it('should return partial errors for partially complete form', () => {
      const form = {
        firstName: 'John',
        lastName: '',
        relationship: '1',
      } as AddNewOfficialPinPhoneContactDetails

      const errors = validateAddNewOfficialContact(form)

      expect(errors.firstName).toBeUndefined()
      expect(errors.lastName).toBeDefined()
      expect(errors.relationship).toBeUndefined()
      expect(errors.telephone1).toBeDefined()
    })
  })
})
