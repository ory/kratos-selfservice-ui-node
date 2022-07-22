import { registerStatic } from "@ory/themes/helpers/express"
import express from "express"
import { RouteRegistrator } from "../pkg"

export const registerStaticRoutes: RouteRegistrator = (app) => {
  /*  app.use('/style.css', (req, res) => {
    res.type('text/css')
    const theme = lightTheme || {
      background: {
        surface: '#ff0000'
      }
    }
    res.send(theme)
  })*/
  registerStatic(app)
  //app.use('/', express.static('node_modules/@ory/themes/dist'))
  app.use("/", express.static("public"))
  app.use("/", express.static("node_modules/normalize.css"))
}
