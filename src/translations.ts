import {ExtendedFormField} from "types";

const translations = {
  password: {
    title: 'Password',
    order: 2
  },
  'traits.email': {
    title: 'E-Mail',
    order: 1
  },
  identifier: {
    title: 'E-Mail',
    order: 0
  }
}

type Translations = typeof translations

const getTitle = (key: string, fallbackValue: string): string =>
  key in translations ? translations[(key as keyof Translations)].title : fallbackValue

const getOrder = (field: ExtendedFormField) =>
  field.name in translations ? translations[field.name as keyof Translations].order : Infinity

const sortFormFields = (first: ExtendedFormField, second: ExtendedFormField) =>
  getOrder(first) - getOrder(second)

export {getTitle, sortFormFields}
