// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { UiNodeInputAttributes } from "@ory/client"
import { SelfServiceFlow, UserAuthCard } from "@ory/elements-markup"
import {
  filterNodesByGroups,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui"
import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

export const createLoginRoute: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    res.locals.projectName = "Sign in"

    const {
      flow,
      aal = "",
      refresh = "",
      return_to = "",
      login_challenge,
    } = req.query
    const { frontend, kratosBrowserUrl, logoUrl } = createHelpers(req, res)

    const initFlowQuery = new URLSearchParams({
      aal: aal.toString(),
      refresh: refresh.toString(),
      return_to: return_to.toString(),
    })

    if (isQuerySet(login_challenge)) {
      logger.debug("login_challenge found in URL query: ", { query: req.query })
      initFlowQuery.append("login_challenge", login_challenge)
    }

    const initFlowUrl = getUrlForFlow(kratosBrowserUrl, "login", initFlowQuery)

    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!isQuerySet(flow)) {
      logger.debug("No flow ID found in URL query initializing login flow", {
        query: req.query,
      })
      res.redirect(303, initFlowUrl)
      return
    }

    // It is probably a bit strange to have a logout URL here, however this screen
    // is also used for 2FA flows. If something goes wrong there, we probably want
    // to give the user the option to sign out!
    const logoutUrl =
      (
        await frontend
          .createBrowserLogoutFlow({ cookie: req.header("cookie") })
          .catch(() => ({ data: { logout_url: "" } }))
      ).data.logout_url || ""

    return frontend
      .getLoginFlow({ id: flow, cookie: req.header("cookie") })
      .then(({ data: flow }) => {
        // Render the data using a view (e.g. Jade Template):

        const initRegistrationQuery = new URLSearchParams({
          return_to: return_to.toString(),
        })
        if (flow.oauth2_login_request?.challenge) {
          initRegistrationQuery.set(
            "login_challenge",
            flow.oauth2_login_request.challenge,
          )
        }

        const initRegistrationUrl = getUrlForFlow(
          kratosBrowserUrl,
          "registration",
          initRegistrationQuery,
        )

        res.render("login", {
          nodes: flow.ui.nodes,
          webAuthnHandler: filterNodesByGroups({
            nodes: flow.ui.nodes,
            groups: ["webauthn"],
            attributes: ["button"],
            withoutDefaultAttributes: true,
            withoutDefaultGroup: true,
          })
            .filter(({ attributes }) => isUiNodeInputAttributes(attributes))
            .map(({ attributes }) => {
              return (attributes as UiNodeInputAttributes).onclick
            })
            .filter((c) => c !== undefined),
          card: UserAuthCard({
            title: !(flow.refresh || flow.requested_aal === "aal2")
              ? "Sign In"
              : "Two-Factor Authentication",
            ...(flow.oauth2_login_request && {
              subtitle: `To authenticate ${
                flow.oauth2_login_request.client.client_name ||
                flow.oauth2_login_request.client.client_id
              }`,
            }),
            flow: flow as SelfServiceFlow,
            flowType: "login",
            cardImage: logoUrl,
            additionalProps: {
              forgotPasswordURL: "recovery",
              signupURL: initRegistrationUrl,
              logoutURL: logoutUrl,
            },
          }),
        })
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerLoginRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get("/login", createLoginRoute(createHelpers))
}
