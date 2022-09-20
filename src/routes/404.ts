import { RouteRegistrator } from "../pkg"

export const register404Route: RouteRegistrator = (app) => {
  app.get("*", (req, res) => {
    res.status(404).render("error", {
      message: "The requested page could not be found (404).",
    })
  })
}
