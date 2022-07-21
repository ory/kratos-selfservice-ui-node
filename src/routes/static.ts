import { registerStatic } from "@ory/themes/helpers/express"
import express from "express"
import { RouteRegistrator } from "../pkg"

export const registerStaticRoutes: RouteRegistrator = (app) => {
  registerStatic(app)
  app.use("/", express.static("public"))
  app.use("/", express.static("node_modules/normalize.css"))
}
