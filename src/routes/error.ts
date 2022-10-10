import { UserErrorCard } from "@ory/elements-markup"
import { AxiosError } from "axios"
import {
  basePath,
  defaultConfig,
  isQuerySet,
  joinAbsoluteUrlPath,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

// A simple express handler that shows the error screen.
export const createErrorRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = "An error occurred"
    const { id } = req.query

    const basePath = req.app.locals.basePath

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
            cardImage: (basePath ? `/${basePath}` : "") + "/ory-logo.svg",
            title: "An error occurred",
            backURL: joinAbsoluteUrlPath(basePath || "", "/login"),
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
  app.get("/error", basePath(createHelpers), createErrorRoute(createHelpers))
}
