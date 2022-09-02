import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

export const createVerificationRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = "Verify account"

    const { flow, return_to = "" } = req.query
    const helpers = createHelpers(req)
    const { sdk, kratosBrowserUrl } = helpers
    const initFlowUrl = getUrlForFlow(
      kratosBrowserUrl,
      "verification",
      new URLSearchParams({ return_to: return_to.toString() }),
    )

    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!isQuerySet(flow)) {
      logger.debug("No flow ID found in URL query initializing login flow", {
        query: req.query,
      })
      res.redirect(303, initFlowUrl)
      return
    }

    return (
      sdk
        .getSelfServiceVerificationFlow(flow, req.header("cookie"))
        .then(({ data: flow }) => {
          // Render the data using a view (e.g. Jade Template):
          res.render("verification", flow)
        })
        // Handle errors using ExpressJS' next functionality:
        .catch(redirectOnSoftError(res, next, initFlowUrl))
    )
  }

export const registerVerificationRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get("/verification", createVerificationRoute(createHelpers))
}
