import React from 'react'

const getLabel = value => {
  switch (value) {
    case 'provider':
      return `Continue with ${value}`
    case 'link':
      return `Link ${value}`
    case 'unlink':
      return `Unlink ${value}`
    default:
      return value
  }
}

const FormFieldButton = ({ name, type, value, disabled }) => {
  return (
    <button name={name} type={type} value={value} disabled={disabled}>
      {getLabel(value)}
    </button>
  )
}

export default FormFieldButton
