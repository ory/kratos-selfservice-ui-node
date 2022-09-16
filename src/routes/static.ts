import { RouteRegistrator } from "../pkg"
import { expressHandler } from "@ory/themes/css/express"
import express from "express"

export const registerStaticRoutes: RouteRegistrator = (app) => {
  app.get("/theme.css", expressHandler())
  app.use("/", express.static("public"))
  app.use("/", express.static("node_modules/normalize.css"))
}
