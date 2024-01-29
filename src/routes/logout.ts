// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  RouteCreator,
  RouteRegistrator,
  defaultConfig,
  logger,
  setSession,
} from "../pkg"
import { UserLogoutCard } from "@ory/elements-markup"
import { Request, Response, NextFunction } from "express"

export const createShowLogoutRoute: RouteCreator =
  (createHelpers) =>
  async (req: Request, res: Response, next: NextFunction) => {
    res.locals.projectName = "Logout"

    const { logout_challenge: logoutChallenge } = req.query

    if (typeof logoutChallenge !== "string") {
      logger.debug("Expected a logout challenge to be set but received none.")
      res.redirect("login")
      return
    }

    const { oauth2, shouldSkipLogoutConsent } = createHelpers(req, res)
    oauth2
      .getOAuth2LogoutRequest({ logoutChallenge })
      .then(({ data: body }) => {
        if (shouldSkipLogoutConsent(body)) {
          return oauth2
            .acceptOAuth2LogoutRequest({ logoutChallenge })
            .then(({ data: body }) => res.redirect(body.redirect_to))
        }

        // this should never happen
        if (!req.csrfToken) {
          logger.warn(
            "Expected CSRF token middleware to be set but received none.",
          )
          next(
            new Error(
              "Expected CSRF token middleware to be set but received none.",
            ),
          )
          return
        }

        res.render("logout", {
          card: UserLogoutCard({
            csrfToken: req.csrfToken(true),
            challenge: logoutChallenge,
            action: "logout",
          }),
        })
      })
      .catch(() => res.redirect("login"))
  }

export const createSubmitLogoutRoute: RouteCreator =
  (createHelpers) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { oauth2 } = createHelpers(req, res)
    res.locals.projectName = "Logout"

    // The challenge is now a hidden input field, so let's take it from
    // the request body instead.
    const { challenge: logoutChallenge, submit } = req.body

    if (submit === "No") {
      logger.debug("User rejected to log out.")
      // The user rejected to log out, so we'll redirect to /ui/welcome
      return oauth2
        .rejectOAuth2LogoutRequest({ logoutChallenge })
        .then(() => res.redirect("login"))
        .catch(() => res.redirect("login"))
    } else {
      logger.debug("User agreed to log out.")
      // The user agreed to log out, let's accept the logout request.
      return oauth2
        .acceptOAuth2LogoutRequest({ logoutChallenge })
        .then(({ data: body }) => res.redirect(body.redirect_to))
        .catch(() => res.redirect("login"))
    }
  }

export const registerLogoutRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get(
    "/logout",
    setSession(createHelpers),
    createShowLogoutRoute(createHelpers),
  )
  app.post(
    "/logout",
    setSession(createHelpers),
    createSubmitLogoutRoute(createHelpers),
  )
}
