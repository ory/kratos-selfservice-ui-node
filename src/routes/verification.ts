// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { UiText } from "@ory/client"
import { SelfServiceFlow, UserAuthCard } from "@ory/elements-markup"
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

    const { flow, return_to = "", message } = req.query
    const { frontend, kratosBrowserUrl, logoUrl } = createHelpers(req, res)

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
      frontend
        .getVerificationFlow({ id: flow, cookie: req.header("cookie") })
        .then(({ data: flow }) => {
          const initRegistrationUrl = getUrlForFlow(
            kratosBrowserUrl,
            "registration",
            new URLSearchParams({
              return_to:
                (return_to && return_to.toString()) || flow.return_to || "",
            }),
          )

          if (message) {
            const m: UiText = {
              id: 0,
              text: message.toString(),
              type: "info",
            }

            flow.ui.messages
              ? flow.ui.messages.push(m)
              : (flow.ui.messages = [m])
          }

          // Render the data using a view (e.g. Jade Template):
          res.render("verification", {
            card: UserAuthCard({
              title: "Verify your account",
              flow: flow as SelfServiceFlow,
              flowType: "verification",
              cardImage: logoUrl,
              additionalProps: {
                signupURL: initRegistrationUrl,
              },
            }),
          })
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
