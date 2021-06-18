import cookieParser from 'cookie-parser'
import express, { Request, NextFunction, Response } from 'express'
import handlebars from 'express-handlebars'
import loginHandler from './routes/login'
import registrationHandler from './routes/registration'
import errorHandler from './routes/error'
import dashboard from './routes/dashboard'
import debug from './routes/debug'
import config, { SECURITY_MODE_JWT } from './config'
import { getTitle, onlyNodes, toUiNodePartial } from './helpers/ui'
import * as stubs from './stub/payloads'
import settingsHandler from './routes/settings'
import verifyHandler from './routes/verification'
import recoveryHandler from './routes/recovery'
import morgan from 'morgan'
import * as https from 'https'
import * as fs from 'fs'
import protectSimple from './middleware/simple'
import protectOathkeeper from './middleware/oathkeeper'

export const protect =
  config.securityMode === SECURITY_MODE_JWT ? protectOathkeeper : protectSimple

const app = express()
app.use(morgan('tiny'))
app.use(cookieParser())
app.set('view engine', 'hbs')

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.projectName = config.projectName
  res.locals.baseUrl = config.baseUrl
  res.locals.pathPrefix = config.baseUrl.replace(/\/+$/, '') + '/'
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
      onlyNodes,
      getTitle,
      toUiNodePartial: toUiNodePartial,
    },
  })
)

if (process.env.NODE_ENV === 'stub') {
  // Setting NODE_ENV to "only-ui" disables all integration and only shows the UI. Useful
  // when working on CSS or HTML things.
  app.get('/', dashboard)
  app.get('/auth/registration', (_: Request, res: Response) => {
    res.render('registration', {
      password: stubs.registration.methods.password.config,
      oidc: stubs.registration.methods.oidc.config,
    })
  })
  app.get('/auth/login', (_: Request, res: Response) => {
    res.render('login', {
      password: stubs.login.methods.password.config,
      oidc: stubs.login.methods.oidc.config,
    })
  })
  app.get('/settings', (_: Request, res: Response) => {
    res.render('settings', stubs.settings)
  })
  app.get('/error', (_: Request, res: Response) => res.render('error'))
} else {
  app.get('/', protect, dashboard)
  app.get('/dashboard', protect, dashboard)
  app.get('/auth/registration', registrationHandler)
  app.get('/auth/login', loginHandler)
  app.get('/error', errorHandler)
  app.get('/settings', protect, settingsHandler)
  app.get('/verify', verifyHandler)
  app.get('/recovery', recoveryHandler)
}

app.get('/health', (_: Request, res: Response) => res.send('ok'))
app.get('/debug', debug)

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

let listener = () => {
  let proto = config.https.enabled ? 'https' : 'http'
  console.log(`Listening on ${proto}://0.0.0.0:${port}`)
  console.log(`Security mode: ${config.securityMode}`)
}

if (config.https.enabled) {
  const options = {
    cert: fs.readFileSync(config.https.certificatePath),
    key: fs.readFileSync(config.https.keyPath),
  }

  https.createServer(options, app).listen(port, listener)
} else {
  app.listen(port, listener)
}
