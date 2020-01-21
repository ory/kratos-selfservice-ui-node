const translations = {
  password: 'Password',
  'traits.email': 'E-Mail',
  identifier: 'E-Mail'
}



export default (key: string, fallbackValue: string): string =>
  key in translations ? translations[(key as keyof typeof translations)] : fallbackValue

