import { filterNodesByGroups, getNodeLabel } from "@ory/integrations/ui"
import express, { Request, Response } from "express"
import handlebars from "express-handlebars"
import * as fs from "fs"
import * as https from "https"

import { middleware as middlewareLogger } from "./pkg/logger"
import { toUiNodePartial } from "./pkg/ui"
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

const app = express()

app.use(middlewareLogger)
app.set("view engine", "hbs")

app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    layoutsDir: `${__dirname}/../views/layouts/`,
    partialsDir: `${__dirname}/../views/partials/`,
    defaultLayout: "main",
    helpers: {
      ...require("handlebars-helpers")(),
      jsonPretty: (context: any) => JSON.stringify(context, null, 2),
      onlyNodes: filterNodesByGroups,
      toUiNodePartial,
      getNodeLabel: getNodeLabel,
    },
  }),
)

registerStaticRoutes(app)
registerHealthRoute(app)
registerLoginRoute(app)
registerRecoveryRoute(app)
registerRegistrationRoute(app)
registerSettingsRoute(app)
registerVerificationRoute(app)
registerWelcomeRoute(app)
registerErrorRoute(app)

app.get("/", (req: Request, res: Response) => {
  res.redirect("welcome", 303)
})

register404Route(app)
register500Route(app)

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
