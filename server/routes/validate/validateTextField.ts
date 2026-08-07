type ValidateTextField = {
  fieldValue: string
  fieldName: string
  isRequired?: boolean
  maxLength?: number
}

// eslint-disable-next-line import/prefer-default-export
export const validateTextField = ({
  fieldValue,
  fieldName,
  isRequired = false,
  maxLength = 500,
}: ValidateTextField) => {
  const errors: Record<string, { text: string }> = {}

  const errorMessages: Record<string, string> = {
    Messages: 'Add a message',
    Reason: 'Add a reason',
    Details: 'Add details',
  }

  if (isRequired && !fieldValue) {
    errors[fieldName] = { text: errorMessages[fieldName] }
  }

  if (fieldValue && fieldValue.length > maxLength) {
    errors[fieldName] = { text: `${fieldName} must be ${maxLength} characters or less` }
  }

  return errors
}
