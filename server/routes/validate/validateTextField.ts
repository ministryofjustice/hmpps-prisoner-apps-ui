type ValidateTextField = {
  fieldValue: string
  fieldName: string
  isRequired?: boolean
}

// eslint-disable-next-line import/prefer-default-export
export const validateTextField = ({ fieldValue, fieldName, isRequired = false }: ValidateTextField) => {
  const errors: Record<string, { text: string }> = {}

  const errorMessages: Record<string, string> = {
    Messages: 'Add a message',
    Reason: 'Add a reason',
    Details: 'Add details',
  }

  if (isRequired && !fieldValue) {
    errors[fieldName] = { text: errorMessages[fieldName] }
  }

  if (fieldValue && fieldValue.length > 500) {
    errors[fieldName] = { text: `${fieldName} must be 500 characters or less` }
  }

  return errors
}
