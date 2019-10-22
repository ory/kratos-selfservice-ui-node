import { hive } from './index'
import fetch from 'node-fetch'

export type FormError = {
  code: number
  message: string
  field: string
}

export interface RequestMethod<T> {
  method: string
  config: T
  Errors: FormError[]
}

export interface Config {
  id: string
  return_to: string
  issued_at: Date
  expires_at: Date
  active: string
  methods: {
    password: RequestMethod<FormConfig>
    oidc: RequestMethod<
      FormConfig & {
        providers: FormField[]
      }
    >
  }
}

export type FormField = {
  value?: string
  type: string
  required?: boolean
  label?: string
  error?: FormError
  name: string
}

export interface FormConfig {
  errors?: FormError[]
  action: string
  fields: FormFields
}

export type FormFields = { [key: string]: FormField }

const fetchConfig = (
  path: 'login' | 'registration',
  request: string | string[]
): Promise<Config> => {
  request = Array.isArray(request) ? request[0] : request

  const from = new URL(`${hive.public}/auth/browser/requests/${path}`)
  from.searchParams.set('request', request)

  return fetch(from.toString()).then(res => res.json())
}

export default fetchConfig
