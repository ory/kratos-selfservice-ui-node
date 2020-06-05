import { FormField } from '@oryd/kratos-client'

const translations = {
  password: {
    title: 'Password',
    position: 2,
  },
  'traits.email': {
    title: 'E-Mail',
    position: 1,
  },
  identifier: {
    title: 'E-Mail',
    position: 0,
  },
  to_verify: {
    title: 'Your email address',
    position: 0,
  },
}

type Translations = typeof translations

const getTitle = (key: string): string =>
  key in translations ? translations[key as keyof Translations].title : key

const getPosition = (field: FormField) =>
  field.name && field.name in translations
    ? translations[field.name as keyof Translations].position
    : Infinity

const sortFormFields = (first: FormField, second: FormField) =>
  getPosition(first) - getPosition(second)

// this helper function translates the html input type to the corresponding partial name
const toFormInputPartialName = (type: string) => {
  switch (type) {
    case 'hidden':
      return 'form_input_hidden'
    case 'password':
      return 'form_input_password'
    case 'submit':
      return 'form_field_button'
    default:
      return 'form_input_default'
  }
}

export { getTitle, sortFormFields, toFormInputPartialName }
