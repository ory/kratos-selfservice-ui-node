import { expressHandler, staticAssets } from "@ory/themes/css/express"
import express from "express"
import { RouteRegistrator } from "../pkg"

export const registerStaticRoutes: RouteRegistrator = (app) => {
  app.get(
    "/theme.css",
    expressHandler({
      breakpoints: {
        xs: "0px",
      },
    }),
  )
  app.get("/assets.css", staticAssets())
  app.use("/", express.static("public"))
  app.use("/", express.static("node_modules/normalize.css"))
}
