import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  requireAuth,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

export const createSettingsRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = "Account settings"

    const { flow, return_to = "" } = req.query
    const helpers = createHelpers(req)
    const { sdk, kratosBrowserUrl } = helpers
    const initFlowUrl = getUrlForFlow(
      kratosBrowserUrl,
      "settings",
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

    return sdk
      .getSelfServiceSettingsFlow(flow, undefined, req.header("cookie"))
      .then(({ data: flow }) => {
        // Render the data using a view (e.g. Jade Template):
        res.render("settings", flow)
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerSettingsRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get(
    "/settings",
    requireAuth(createHelpers),
    createSettingsRoute(createHelpers),
  )
}
