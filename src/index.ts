// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  addFavicon,
  defaultConfig,
  detectLanguage,
  handlebarsHelpers,
} from "./pkg"
import { logger, middleware as middlewareLogger } from "./pkg/logger"
import {
  register404Route,
  register500Route,
  registerConsentRoute,
  registerErrorRoute,
  registerHealthRoute,
  registerLoginRoute,
  registerRecoveryRoute,
  registerRegistrationRoute,
  registerSessionsRoute,
  registerSettingsRoute,
  registerStaticRoutes,
  registerVerificationRoute,
  registerWelcomeRoute,
  registerLogoutRoute,
} from "./routes"
import { csrfErrorHandler } from "./routes/csrfError"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import { DoubleCsrfCookieOptions, doubleCsrf } from "csrf-csrf"
import express, { Request, Response } from "express"
import { engine } from "express-handlebars"
import * as fs from "fs"
import * as https from "https"

const baseUrl = process.env.BASE_PATH || "/"

const app = express()
const router = express.Router()

const cookieOptions: DoubleCsrfCookieOptions = {
  sameSite: "lax",
  signed: true,
  // set secure cookies by default (recommended in production)
  // can be disabled through DANGEROUSLY_DISABLE_SECURE_COOKIES=true env var
  secure: true,
  ...(process.env.DANGEROUSLY_DISABLE_SECURE_CSRF_COOKIES && {
    secure: false,
  }),
}

const cookieName = process.env.CSRF_COOKIE_NAME || "__Host-ax-x-csrf-token"
const cookieSecret = process.env.CSRF_COOKIE_SECRET

// Sets up csrf protection
const {
  invalidCsrfTokenError,
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => cookieSecret || "", // A function that optionally takes the request and returns a secret
  cookieName: cookieName, // The name of the cookie to be used, recommend using Host prefix.
  cookieOptions,
  ignoredMethods: ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"], // A list of request methods that will not be protected.
  getTokenFromRequest: (req: Request) => {
    logger.debug("Getting CSRF token from request", { body: req.body })
    return req.body._csrf
  }, // A function that returns the token from the request
})

app.use(middlewareLogger)
app.use(cookieParser(process.env.COOKIE_SECRET || ""))
app.use(addFavicon(defaultConfig))
app.use(detectLanguage)
app.use(bodyParser.urlencoded({ extended: false }))
app.set("view engine", "hbs")

app.engine(
  "hbs",
  engine({
    extname: "hbs",
    layoutsDir: `${__dirname}/../views/layouts/`,
    partialsDir: `${__dirname}/../views/partials/`,
    defaultLayout: "auth",
    helpers: handlebarsHelpers,
  }),
)

registerStaticRoutes(router)
registerHealthRoute(router)
registerLoginRoute(router)
registerRecoveryRoute(router)
registerRegistrationRoute(router)
registerSettingsRoute(router)
registerVerificationRoute(router)
registerSessionsRoute(router)
registerWelcomeRoute(router)
registerErrorRoute(router)

// all routes registered under the /consent path are protected by CSRF
router.use("/consent", doubleCsrfProtection)
router.use("/consent", csrfErrorHandler(invalidCsrfTokenError))
registerConsentRoute(router)

// all routes registered under the /logout path are protected by CSRF
router.use("/logout", doubleCsrfProtection)
router.use("/logout", csrfErrorHandler(invalidCsrfTokenError))
registerLogoutRoute(router)

router.get("/", (req: Request, res: Response) => {
  res.redirect(303, "welcome")
})

register404Route(router)
register500Route(router)
app.use(baseUrl, router)

const port = Number(process.env.PORT) || 3000

let listener = (proto: "http" | "https") => () => {
  logger.info(`Listening on ${proto}://0.0.0.0:${port}`)
}

// When using the Ory Admin API Token, we assume that this application is also
// handling OAuth2 Consent requests. In that case we need to ensure that the
// COOKIE_SECRET and CSRF_COOKIE_SECRET environment variables are set.
if (
  (process.env.ORY_ADMIN_API_TOKEN &&
    String(process.env.COOKIE_SECRET || "").length < 8) ||
  String(process.env.CSRF_COOKIE_NAME || "").length === 0 ||
  String(process.env.CSRF_COOKIE_SECRET || "").length < 8
) {
  logger.error(
    "Cannot start the server without the required environment variables!",
  )
  logger.error(
    "COOKIE_SECRET must be set and be at least 8 alphanumerical character `export COOKIE_SECRET=...`",
  )
  logger.error(
    "CSRF_COOKIE_NAME must be set! Prefix the name to scope it to your domain `__HOST-` `export CSRF_COOKIE_NAME=...`",
  )
  logger.error(
    "CSRF_COOKIE_SECRET must be set and be at least 8 alphanumerical character `export CSRF_COOKIE_SECRET=...`",
  )
} else {
  if (process.env.TLS_CERT_PATH?.length && process.env.TLS_KEY_PATH?.length) {
    const options = {
      cert: fs.readFileSync(process.env.TLS_CERT_PATH),
      key: fs.readFileSync(process.env.TLS_KEY_PATH),
    }

    https.createServer(options, app).listen(port, listener("https"))
  } else {
    app.listen(port, listener("http"))
  }
}
