import { UserAuthCard, SelfServiceFlow } from "@ory/elements-markup"
import {
  basePath,
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  requireNoAuth,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

export const createRecoveryRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = "Recover account"

    const { flow, return_to = "" } = req.query
    const basePath = req.app.locals.basePath
    const helpers = createHelpers(req)
    const { sdk, kratosBrowserUrl } = helpers
    const initFlowUrl = getUrlForFlow(
      kratosBrowserUrl,
      "recovery",
      new URLSearchParams({ return_to: return_to.toString() }),
    )

    const initLoginUrl = getUrlForFlow(
      kratosBrowserUrl,
      "login",
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
      .getSelfServiceRecoveryFlow(flow, req.header("cookie"))
      .then(({ data: flow }) => {
        res.render("recovery", {
          card: UserAuthCard({
            title: "Recover your account",
            flow: flow as SelfServiceFlow,
            flowType: "recovery",
            cardImage: (basePath ? `/${basePath}` : "") + "/ory-logo.svg",
            additionalProps: {
              loginURL: initLoginUrl,
            },
          }),
        })
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerRecoveryRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get(
    "/recovery",
    requireNoAuth(createHelpers),
    basePath(createHelpers),
    createRecoveryRoute(createHelpers),
  )
}
