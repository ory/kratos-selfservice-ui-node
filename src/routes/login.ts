// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"
import { LoginFlow } from "@ory/client"
import { UserAuthCard } from "@ory/elements-markup"
import path from "path"
import { URLSearchParams } from "url"

export const createLoginRoute: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    res.locals.projectName = "Sign in"

    const {
      flow,
      aal = "",
      refresh = "",
      return_to = "",
      organization = "",
      via = "",
      login_challenge,
    } = req.query
    const { frontend, kratosBrowserUrl, logoUrl, extraPartials } =
      createHelpers(req, res)

    const initFlowQuery = new URLSearchParams({
      aal: aal.toString(),
      refresh: refresh.toString(),
      return_to: return_to.toString(),
      organization: organization.toString(),
      via: via.toString(),
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
    const getLogoutUrl = async (loginFlow: LoginFlow) => {
      let logoutUrl = ""
      try {
        logoutUrl = await frontend
          .createBrowserLogoutFlow({
            cookie: req.header("cookie"),
            returnTo:
              (return_to && return_to.toString()) || loginFlow.return_to || "",
          })
          .then(({ data }) => data.logout_url)
        return logoutUrl
      } catch (err) {
        logger.error("Unable to create logout URL", { error: err })
      }
    }

    const redirectToVerificationFlow = (loginFlow: LoginFlow) => {
      // we will create a new verification flow and redirect the user to the verification page
      frontend
        .createBrowserVerificationFlow({
          returnTo:
            (return_to && return_to.toString()) || loginFlow.return_to || "",
        })
        .then(({ headers, data: verificationFlow }) => {
          // we need the csrf cookie from the verification flow
          if (headers["set-cookie"]) {
            res.setHeader("set-cookie", headers["set-cookie"])
          }
          // encode the verification flow id in the query parameters
          const verificationParameters = new URLSearchParams({
            flow: verificationFlow.id,
            message: JSON.stringify(loginFlow.ui.messages),
          })

          const baseUrl = req.path.split("/")
          // get rid of the last part of the path (e.g. "login")
          baseUrl.pop()

          // redirect to the verification page with the custom message
          res.redirect(
            303,
            // join the base url with the verification path
            path.join(
              req.baseUrl,
              "verification?" + verificationParameters.toString(),
            ),
          )
        })
        .catch(
          redirectOnSoftError(
            res,
            next,
            getUrlForFlow(
              kratosBrowserUrl,
              "verification",
              new URLSearchParams({
                return_to:
                  (return_to && return_to.toString()) ||
                  loginFlow.return_to ||
                  "",
              }),
            ),
          ),
        )
    }

    return frontend
      .getLoginFlow({ id: flow, cookie: req.header("cookie") })
      .then(async ({ data: flow }) => {
        if (flow.ui.messages && flow.ui.messages.length > 0) {
          // the login requires that the user verifies their email address before logging in
          if (flow.ui.messages.some(({ id }) => id === 4000010)) {
            // we will create a new verification flow and redirect the user to the verification page
            return redirectToVerificationFlow(flow)
          }
        }

        // Render the data using a view (e.g. Jade Template):
        const initRegistrationQuery = new URLSearchParams({
          return_to:
            (return_to && return_to.toString()) || flow.return_to || "",
        })
        if (flow.oauth2_login_request?.challenge) {
          initRegistrationQuery.set(
            "login_challenge",
            flow.oauth2_login_request.challenge,
          )
        }

        let initRecoveryUrl = ""
        const initRegistrationUrl = getUrlForFlow(
          kratosBrowserUrl,
          "registration",
          initRegistrationQuery,
        )
        if (!flow.refresh) {
          initRecoveryUrl = getUrlForFlow(
            kratosBrowserUrl,
            "recovery",
            new URLSearchParams({
              return_to:
                (return_to && return_to.toString()) || flow.return_to || "",
            }),
          )
        }

        let logoutUrl: string | undefined = ""
        if (flow.requested_aal === "aal2" || flow.refresh) {
          logoutUrl = await getLogoutUrl(flow)
        }

        res.render("login", {
          nodes: flow.ui.nodes,
          card: UserAuthCard(
            {
              flow,
              flowType: "login",
              cardImage: logoUrl,
              additionalProps: {
                forgotPasswordURL: initRecoveryUrl,
                signupURL: initRegistrationUrl,
                logoutURL: logoutUrl,
                loginURL: initFlowUrl,
              },
            },
            { locale: res.locals.lang },
          ),
          extraPartial: extraPartials?.login,
          extraContext: res.locals.extraContext,
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
