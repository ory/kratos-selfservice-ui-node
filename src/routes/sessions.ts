import { CodeBox } from "@ory/elements-markup"

import {
  defaultConfig,
  requireAuth,
  RouteCreator,
  RouteRegistrator,
  setSession,
} from "../pkg"
import { navigationMenu } from "../pkg/ui"

export const createSessionsRoute: RouteCreator =
  (createHelpers) => async (req, res) => {
    const { sdk } = createHelpers(req)
    const session = req.session

    // Create a logout URL
    const logoutUrl =
      (
        await sdk
          .createSelfServiceLogoutFlowUrlForBrowsers(req.header("cookie"))
          .catch(() => ({ data: { logout_url: "" } }))
      ).data.logout_url || ""

    res.render("session", {
      layout: "welcome",
      sessionCard: CodeBox({ children: JSON.stringify(session, null, 2) }),
      nav: navigationMenu(session, logoutUrl, "sessions"),
    })
  }

export const registerSessionsRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  route = "/sessions",
) => {
  app.get(route, requireAuth(createHelpers), createSessionsRoute(createHelpers))
}
