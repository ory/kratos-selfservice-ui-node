// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  addFavicon,
  defaultConfig,
  detectLanguage,
  handlebarsHelpers,
} from "./pkg"
import { middleware as middlewareLogger } from "./pkg/logger"
import {
  register404Route,
  register500Route,
  registerConsentPostRoute,
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
} from "./routes"
import cookieParser from "cookie-parser"
import express, { Request, Response } from "express"
import { engine } from "express-handlebars"
import * as fs from "fs"
import * as https from "https"

const baseUrl = process.env.BASE_PATH || "/"

const app = express()
const router = express.Router()

app.use(middlewareLogger)
app.use(cookieParser(process.env.COOKIE_SECRET || ""))
app.use(addFavicon(defaultConfig))
app.use(detectLanguage)
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

registerHealthRoute(router)
registerLoginRoute(router)
registerConsentRoute(app)
registerConsentPostRoute(app)
registerRecoveryRoute(router)
registerRegistrationRoute(router)
registerSettingsRoute(router)
registerVerificationRoute(router)
registerSessionsRoute(router)
registerWelcomeRoute(router)
registerErrorRoute(router)

router.get("/", (req: Request, res: Response) => {
  res.redirect(303, "welcome")
})

registerStaticRoutes(router)
register404Route(router)
register500Route(router)

app.use(baseUrl, router)

const port = Number(process.env.PORT) || 3000

let listener = (proto: "http" | "https") => () => {
  console.log(`Listening on ${proto}://0.0.0.0:${port}`)
}

// When using the Ory Admin API Token, we assume that this application is also
// handling OAuth2 Consent requests. In that case we need to ensure that the
// COOKIE_SECRET and CSRF_COOKIE_SECRET environment variables are set.
if (
  (process.env.ORY_ADMIN_API_TOKEN &&
    String(process.env.COOKIE_SECRET || "").length < 8) ||
  String(process.env.CSRF_COOKIE_SECRET || "").length < 8
) {
  console.error(
    "Cannot start the server without the required environment variables!",
  )
  console.error(
    "COOKIE_SECRET must be set and be at least 8 alphanumerical character `export COOKIE_SECRET=...`",
  )
  console.error(
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
