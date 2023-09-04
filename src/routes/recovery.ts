// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  requireNoAuth,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"
import { UserAuthCard } from "@ory/elements-markup"

export const createRecoveryRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = "Recover account"

    const { flow, return_to = "" } = req.query
    const { frontend, kratosBrowserUrl, logoUrl, faviconUrl, faviconType } =
      createHelpers(req, res)
    res.locals.faviconUrl = faviconUrl
    res.locals.faviconType = faviconType
    const initFlowUrl = getUrlForFlow(
      kratosBrowserUrl,
      "recovery",
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

    return frontend
      .getRecoveryFlow({ id: flow, cookie: req.header("cookie") })
      .then(({ data: flow }) => {
        const initLoginUrl = getUrlForFlow(
          kratosBrowserUrl,
          "login",
          new URLSearchParams({
            return_to:
              (return_to && return_to.toString()) || flow.return_to || "",
          }),
        )

        res.render("recovery", {
          card: UserAuthCard(
            {
              flow,
              flowType: "recovery",
              cardImage: logoUrl,
              additionalProps: {
                loginURL: initLoginUrl,
              },
            },
            {
              locale: res.locals.lang,
            },
          ),
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
    createRecoveryRoute(createHelpers),
  )
}
