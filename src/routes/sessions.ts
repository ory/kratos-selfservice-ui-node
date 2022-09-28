import { CodeBox, Typography } from "@ory/elements-markup"
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

    const identityCredentialTrait =
      session?.identity.traits.email || session?.identity.traits.username || ""

    const sessionText =
      identityCredentialTrait !== ""
        ? ` and you are currently logged in as ${identityCredentialTrait} `
        : ""

    res.render("session", {
      layout: "welcome",
      sessionInfoText: Typography({
        children: `Your browser holds an active Ory Session for ${req.header(
          "host",
        )}${sessionText}- changing properties inside Acount Settings will be reflected in the decoded Ory Session.`,
        size: "small",
        color: "foregroundMuted",
      }),
      traits: {
        id: session?.identity.id,
        ...session?.identity.traits,
        "signup date": session?.identity.created_at || "",
        // map the session's authentication level to a human readable string
        ...session?.authentication_methods?.reduce<any>(
          (methods, method, i) => {
            methods[`authentication method used`] = `${method.method} (${
              method.completed_at && new Date(method.completed_at).toUTCString()
            })`
            return methods
          },
          {},
        ),
        "authentiction level":
          session?.authenticator_assurance_level === "aal2"
            ? "two-factor used (aal2)"
            : "single-factor used (aal1)",
        ...(session?.expires_at && {
          "session expires at": new Date(session?.expires_at).toUTCString(),
        }),
        ...(session?.authenticated_at && {
          "session authenticated at": new Date(
            session?.authenticated_at,
          ).toUTCString(),
        }),
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
