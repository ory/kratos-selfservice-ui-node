import { FormField } from 'types'

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
}

type Translations = typeof translations

const getTitle = (key: string): string =>
  key in translations ? translations[key as keyof Translations].title : key

const getPosition = (field: FormField) =>
  field.name in translations
    ? translations[field.name as keyof Translations].position
    : Infinity

const sortFormFields = (first: FormField, second: FormField) =>
  getPosition(first) - getPosition(second)

// this helper function translates the html input type to the corresponding partial name
const toFormInputPartialName = (type: string) => {
  switch (type) {
    case 'hidden':
      return 'hiddenFormInput'
    case 'password':
      return 'passwordFormInput'
    default:
      return 'genericFormInput'
  }
}

export { getTitle, sortFormFields, toFormInputPartialName }
