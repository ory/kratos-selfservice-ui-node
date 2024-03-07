// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
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
import { UserSettingsScreen } from "@ory/elements-markup"

export const createSettingsRoute: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    res.locals.projectName = "Account settings"

    const { flow, return_to = "" } = req.query
    const helpers = createHelpers(req, res)
    const { frontend, kratosBrowserUrl } = helpers
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

    return frontend
      .getSettingsFlow({ id: flow, cookie: req.header("cookie") })
      .then(async ({ data: flow }) => {
        const logoutUrl =
          (await frontend
            .createBrowserLogoutFlow({
              cookie: req.header("cookie"),
              returnTo:
                (return_to && return_to.toString()) || flow.return_to || "",
            })
            .then(({ data }) => data.logout_url)
            .catch(() => "")) || ""

        const settingsScreen = UserSettingsScreen(
          {
            flow,
            logoutUrl,
            navClassName: "main-nav",
            headerContainerClassName: "spacing-32",
            dividerClassName: "divider-left",
            settingsCardContainerClassName: "spacing-32",
          },
          {
            backUrl: flow.return_to || getUrlForFlow(kratosBrowserUrl, "login"),
            flow,
            logoutUrl,
          },
          {
            locale: res.locals.lang,
          },
        )
        // Render the data using a view (e.g. Jade Template):
        res.render("settings", {
          layout: "settings",
          nodes: flow.ui.nodes,
          nav: settingsScreen.Nav,
          settingsScreen: settingsScreen.Body,
        })
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
