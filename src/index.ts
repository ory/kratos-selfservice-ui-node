// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import cookieParser from "cookie-parser"
import express, { Request, Response } from "express"
import { engine } from "express-handlebars"
import * as fs from "fs"
import * as https from "https"
import { handlebarsHelpers } from "./pkg"
import { middleware as middlewareLogger } from "./pkg/logger"
import {
  register404Route,
  register500Route,
  registerErrorRoute,
  registerHealthRoute,
  registerLoginRoute,
  registerRecoveryRoute,
  registerRegistrationRoute,
  registerSettingsRoute,
  registerStaticRoutes,
  registerVerificationRoute,
  registerWelcomeRoute,
} from "./routes"
import { registerSessionsRoute } from "./routes/sessions"

const baseUrl = process.env.BASE_PATH || "/"

const app = express()
const router = express.Router()

app.use(middlewareLogger)
app.use(cookieParser())
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

if (process.env.TLS_CERT_PATH?.length && process.env.TLS_KEY_PATH?.length) {
  const options = {
    cert: fs.readFileSync(process.env.TLS_CERT_PATH),
    key: fs.readFileSync(process.env.TLS_KEY_PATH),
  }

  https.createServer(options, app).listen(port, listener("https"))
} else {
  app.listen(port, listener("http"))
}
