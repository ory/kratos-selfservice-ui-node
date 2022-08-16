import { RegisterOryThemesExpress } from "@ory/themes"
import { defaultLightTheme } from "@ory/themes"
import express from "express"
import { RouteRegistrator } from "../pkg"
import sdk from "../pkg/sdk"

export const registerStaticRoutes: RouteRegistrator = (app) => {
  RegisterOryThemesExpress(app, {
    ...defaultLightTheme,
  })
  app.use("/", express.static("public"))
  app.use("/.well-known/ory/webauthn.js", (req, res) => {
    res.contentType("text/javascript")
    sdk.getWebAuthnJavaScript().then(({ data }) => {
      res.send(data)
    })
  })
}
