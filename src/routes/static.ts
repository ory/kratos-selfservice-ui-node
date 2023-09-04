// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { defaultConfig, RouteRegistrator } from "../pkg"
import sdk from "../pkg/sdk"
import {
  defaultLightTheme,
  RegisterOryElementsExpress,
} from "@ory/elements-markup"
import express from "express"

export const registerStaticRoutes: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  RegisterOryElementsExpress(app, defaultLightTheme, createHelpers)
  app.use("/", express.static("public"))
  app.use("/.well-known/ory/webauthn.js", (req, res) => {
    res.contentType("text/javascript")
    sdk.frontend.getWebAuthnJavaScript().then(({ data }) => {
      res.send(data)
    })
  })
  app.use("/", express.static("node_modules/@ory/elements-markup/dist/"))
}
