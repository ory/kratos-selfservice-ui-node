import crypto from 'crypto'

export const SECURITY_MODE_STANDALONE = 'cookie'
export const SECURITY_MODE_JWT = 'jwt'

const baseUrl = process.env.BASE_URL || '/'

let securityMode = SECURITY_MODE_STANDALONE
let browserUrl = process.env.KRATOS_BROWSER_URL || ''
let publicUrl = process.env.KRATOS_PUBLIC_URL || ''
switch ((process.env.SECURITY_MODE || '').toLowerCase()) {
  case 'jwt':
  case 'oathkeeper':
    securityMode = SECURITY_MODE_JWT
    break
  case 'cookie':
  case 'standalone':
  default:
    securityMode = SECURITY_MODE_STANDALONE
}

const cookieSecret = crypto.randomBytes(48).toString('hex')

export default {
  kratos: {
    browser: browserUrl.replace(/\/+$/, ''),
    admin: (process.env.KRATOS_ADMIN_URL || '').replace(/\/+$/, ''),
    public: publicUrl.replace(/\/+$/, ''),
  },
  hydra: {
    admin: (process.env.HYDRA_ADMIN_URL || '').replace(/\/+$/, ''),
  },
  baseUrl,
  jwksUrl: process.env.JWKS_URL || '/',
  projectName: process.env.PROJECT_NAME || 'SecureApp',

  securityMode,
  SECURITY_MODE_JWT,
  SECURITY_MODE_STANDALONE,

  cookieSecret: process.env.HYDRA_COOKIE_SECRET || cookieSecret,

  https: {
    enabled:
      process.env.hasOwnProperty('TLS_KEY_PATH') &&
      process.env.hasOwnProperty('TLS_CERT_PATH'),
    certificatePath: process.env.TLS_CERT_PATH || '',
    keyPath: process.env.TLS_KEY_PATH || '',
  },
}
