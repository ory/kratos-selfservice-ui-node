import { UserErrorCard } from "@ory/elements-markup"
import { RouteRegistrator } from "../pkg"

export const register404Route: RouteRegistrator = (app) => {
  app.get("*", (req, res) => {
    const basePath = req.app.locals.basePath
    res.status(404).render("error", {
      card: UserErrorCard({
        title: "404 - Page not found",
        cardImage: (basePath ? `/${basePath}` : "") + "/ory-logo.svg",
        backURL: basePath || "/",
        error: {
          id: "404",
          error: {
            reason: "The requested page could not be found (404).",
            code: 404,
          },
        },
      }),
    })
  })
}
