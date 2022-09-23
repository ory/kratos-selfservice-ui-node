import { CodeBox } from "@ory/elements-markup"
import {
  defaultConfig,
  requireAuth,
  RouteCreator,
  RouteRegistrator,
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
      traits: {
        ...session?.identity.traits,
        ...{ created_at: session?.identity.created_at || "" },
        ...session?.authentication_methods?.reduce<any>(
          (methods, method, i) => {
            methods[
              `authentication_method: ${
                method.completed_at &&
                new Date(method.completed_at).toUTCString()
              }`
            ] = method.method
            return methods
          },
          {},
        ),
        authenticator_assurance_level: session?.authenticator_assurance_level,
      },
      sessionCodeBox: CodeBox({
        className: "session-code-box",
        children: JSON.stringify(session, null, 2),
      }),
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
