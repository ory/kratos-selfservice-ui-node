import { UserErrorCard } from "@ory/elements-markup"
import { joinAbsoluteUrlPath, RouteRegistrator } from "../pkg"

export const register404Route: RouteRegistrator = (app) => {
  app.get("*", (req, res) => {
    const baseUrl = joinAbsoluteUrlPath("/", res.app.locals.baseUrl || "")
    //res.locals.basePath =  baseUrl === "/" ? baseUrl : baseUrl + "/"
    res.status(404).render("error", {
      card: UserErrorCard({
        title: "404 - Page not found",
        cardImage: "ory-logo.svg",
        backUrl: "sessions",
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
