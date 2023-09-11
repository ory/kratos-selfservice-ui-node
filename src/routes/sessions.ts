// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  defaultConfig,
  requireAuth,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"
import { navigationMenu } from "../pkg/ui"
import { CodeBox, Typography } from "@ory/elements-markup"

export const createSessionsRoute: RouteCreator =
  (createHelpers) => async (req, res) => {
    res.locals.projectName = "Session Information"
    const { frontend } = createHelpers(req, res)
    const session = req.session

    // Create a logout URL
    const logoutUrl =
      (
        await frontend
          .createBrowserLogoutFlow({ cookie: req.header("cookie") })
          .catch(() => ({ data: { logout_url: "" } }))
      ).data.logout_url || ""

    const identityCredentialTrait =
      session?.identity?.traits.email ||
      session?.identity?.traits.username ||
      ""

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
        id: session?.identity?.id,
        // sometimes the identity schema could contain recursive objects
        // for this use case we will just stringify the object instead of recursively flatten the object
        ...Object.entries(session?.identity?.traits).reduce<
          Record<string, any>
        >((traits, [key, value]) => {
          traits[key] =
            typeof value === "object" ? JSON.stringify(value) : value
          return traits
        }, {}),
        "signup date": session?.identity?.created_at || "",
        "authentication level":
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
      // map the session's authentication level to a human readable string
      // this produces a list of objects
      authMethods: session?.authentication_methods?.reduce<any>(
        (methods, method, i) => {
          methods.push({
            [`authentication method used`]: `${method.method} (${
              method.completed_at && new Date(method.completed_at).toUTCString()
            })`,
          })
          return methods
        },
        [],
      ),
      sessionCodeBox: CodeBox({
        className: "session-code-box",
        children: JSON.stringify(session, null, 2),
      }),
      nav: navigationMenu({
        navTitle: res.locals.projectName,
        session,
        logoutUrl,
        selectedLink: "sessions",
      }),
    })
  }

export const registerSessionsRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  route = "/sessions",
) => {
  app.get(route, requireAuth(createHelpers), createSessionsRoute(createHelpers))
}
