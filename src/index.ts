import cookieParser from 'cookie-parser'
import express, { Request, NextFunction, Response } from 'express'
import handlebars from 'express-handlebars'
import request from 'request'
import { authHandler } from './routes/auth'
import hydraauth from './routes/hydra'
import { getConsent, postConsent } from './routes/consent'
import errorHandler from './routes/error'
import dashboard from './routes/dashboard'
import home from './routes/home'
import debug from './routes/debug'
import config, { SECURITY_MODE_JWT, SECURITY_MODE_STANDALONE } from './config'
import jwks from 'jwks-rsa'
import jwt from 'express-jwt'
import {
  getTitle,
  sortFormFields,
  toFormInputPartialName,
} from './translations'
import * as stubs from './stub/payloads'
import { FormField, PublicApi } from '@oryd/kratos-client'
import settingsHandler from './routes/settings'
import verifyHandler from './routes/verification'
import recoveryHandler from './routes/recovery'
import morgan from 'morgan'
import bodyParser from 'body-parser'

const protectOathKeeper = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secret: jwks.expressJwtSecret({
    cache: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.jwksUrl,
  }),
  algorithms: ['RS256'],
})

const publicEndpoint = new PublicApi(config.kratos.public)
const protectProxy = (req: Request, res: Response, next: NextFunction) => {
  // When using ORY Oathkeeper, the redirection is done by ORY Oathkeeper.
  // Since we're checking for the session ourselves here, we redirect here
  // if the session is invalid.
  publicEndpoint
    .whoami(req as { headers: { [name: string]: string } })
    .then(({ body, response }) => {
      ;(req as Request & { user: any }).user = { session: body }
      next()
    })
    .catch(() => {
      res.redirect(config.baseUrl + '/auth/login')
    })
}

const protect =
  config.securityMode === SECURITY_MODE_JWT ? protectOathKeeper : protectProxy

const app = express()
app.use(morgan('tiny'))
app.use(cookieParser())
app.set('view engine', 'hbs')

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.projectName = config.projectName
  res.locals.baseUrl = config.baseUrl
  res.locals.pathPrefix = config.baseUrl ? '' : '/'
  next()
})
app.use(express.static('public'))
app.use(express.static('node_modules/normalize.css'))

app.engine(
  'hbs',
  handlebars({
    extname: 'hbs',
    layoutsDir: `${__dirname}/../views/layouts/`,
    partialsDir: `${__dirname}/../views/partials/`,
    defaultLayout: 'main',
    helpers: {
      ...require('handlebars-helpers')(),
      json: (context: any) => JSON.stringify(context),
      jsonPretty: (context: any) => JSON.stringify(context, null, 2),
      getTitle,
      toFormInputPartialName,
      logoutUrl: (context: any) =>
        `${config.kratos.browser}/self-service/browser/flows/logout`,
    },
  })
)

if (process.env.NODE_ENV === 'stub') {
  // Setting NODE_ENV to "only-ui" disables all integration and only shows the UI. Useful
  // when working on CSS or HTML things.
  app.get('/', dashboard)
  app.get('/auth/registration', (_: Request, res: Response) => {
    const config = stubs.registration.methods.password.config
    res.render('registration', {
      password: stubs.registration.methods.password.config,
      oidc: stubs.registration.methods.oidc.config,
    })
  })
  app.get('/auth/login', (_: Request, res: Response) => {
    const config = stubs.login.methods.password.config
    res.render('login', {
      password: stubs.login.methods.password.config,
      oidc: stubs.login.methods.oidc.config,
    })
  })
  app.get('/settings', (_: Request, res: Response) => {
    res.render('settings', stubs.settings)
  })
  app.get('/error', (_: Request, res: Response) => res.render('error'))
  app.get('/consent', (_: Request, res: Response) => {
    const config = stubs.registration.methods.password.config
    res.render('consent', {
      csrfToken: 'no CSRF!',
      challenge: "challenge",
      requested_scope: ["scope1", "scope2"],
      user: "response.subject",
      client: "response.client",
    });
  })
} else {
  app.get('/', protect, home)
  app.get('/dashboard', protect, dashboard)
  app.get('/auth/registration', authHandler('registration'))
  app.get('/auth/login', authHandler('login'))
  app.get('/auth/hydra/login', hydraauth)
  app.get('/consent', protect, getConsent, errorHandler)
  app.post('/consent', protect, bodyParser.urlencoded({ extended: true }), postConsent)
  app.get('/error', errorHandler)
  app.get('/settings', protect, settingsHandler)
  app.get('/verify', verifyHandler)
  app.get('/recovery', recoveryHandler)
}

app.get('/health', (_: Request, res: Response) => res.send('ok'))
app.get('/debug', debug)

if (config.securityMode === SECURITY_MODE_STANDALONE) {
  // If this security mode is enabled, we redirect all requests matching `/self-service` to ORY Kratos
  app.use(
    '/.ory/kratos/public/',
    (req: Request, res: Response, next: NextFunction) => {
      const url =
        config.kratos.public + req.url.replace('/.ory/kratos/public', '')
      req
        .pipe(request(url, { followRedirect: false }).on('error', next))
        .pipe(res)
    }
  )
}

app.get('*', (_: Request, res: Response) => {
  res.redirect(config.baseUrl)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).render('error', {
    message: JSON.stringify(err, null, 2),
  })
})

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`)
  console.log(`Security mode: ${config.securityMode}`)
})
