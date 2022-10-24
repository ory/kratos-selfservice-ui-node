import { UserErrorCard } from "@ory/elements-markup"
import { AxiosError } from "axios"
import {
  defaultConfig,
  isQuerySet,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

// A simple express handler that shows the error screen.
export const createErrorRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = "An error occurred"
    const { id } = req.query

    // Get the SDK
    const { sdk } = createHelpers(req)

    if (!isQuerySet(id)) {
      // No error was send, redirecting back to home.
      res.redirect("welcome")
      return
    }

    sdk
      .getSelfServiceError(id)
      .then(({ data }) => {
        res.status(200).render("error", {
          card: UserErrorCard({
            error: data,
            title: "An error occurred",
            backUrl: req.header("Referer") || "welcome",
          }),
        })
      })
      .catch((err: AxiosError) => {
        if (!err.response) {
          next(err)
          return
        }

        if (err.response.status === 404) {
          // The error could not be found, redirect back to home.
          res.redirect("welcome")
          return
        }

        next(err)
      })
  }

export const registerErrorRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get("/error", createErrorRoute(createHelpers))
}
