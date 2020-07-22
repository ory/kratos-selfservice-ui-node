import winston from 'winston'
import crypto from 'crypto'

// Replace this with how you think logging should look like
export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
})

export const SECURITY_MODE_STANDALONE = 'cookie'
export const SECURITY_MODE_JWT = 'jwt'

const baseUrl = (process.env.BASE_URL || '').replace(/\/+$/, '')

let securityMode = SECURITY_MODE_JWT
let browserUrl = process.env.KRATOS_BROWSER_URL || ''
let publicUrl = process.env.KRATOS_PUBLIC_URL || ''
switch ((process.env.SECURITY_MODE || '').toLowerCase()) {
  case 'cookie':
  case 'standalone':
    securityMode = SECURITY_MODE_STANDALONE
    browserUrl = baseUrl + '/.ory/kratos/public/'
    break
  case 'jwt':
  case 'oathkeeper':
  default:
    securityMode = SECURITY_MODE_JWT
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

  cookieSecret: process.env.COOKIE_SECRET || cookieSecret,

  https: {
    enabled:
      process.env.hasOwnProperty('TLS_KEY_PATH') &&
      process.env.hasOwnProperty('TLS_CERT_PATH'),
    certificatePath: process.env.TLS_CERT_PATH || '',
    keyPath: process.env.TLS_KEY_PATH || '',
  },
}
