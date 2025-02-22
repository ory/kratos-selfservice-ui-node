// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { RouteOptionsCreator } from "./route"
import sdk, { apiBaseUrl } from "./sdk"
import { filterNodesByGroups } from "./ui_nodes"
import {
  UiNode,
  ErrorAuthenticatorAssuranceLevelNotSatisfied,
  OAuth2LogoutRequest,
} from "@ory/client"
import { ButtonLink, Divider, MenuLink, Typography } from "@ory/elements-markup"
import { AxiosError } from "axios"
import { NextFunction, Response } from "express"
import { UnknownObject } from "express-handlebars/types"

export * from "./logger"
export * from "./middleware"
export * from "./route"

export const removeTrailingSlash = (s: string) => s.replace(/\/$/, "")
export const getUrlForFlow = (
  base: string,
  flow: string,
  query?: URLSearchParams,
) =>
  `${removeTrailingSlash(base)}/self-service/${flow}/browser${
    query ? `?${query.toString()}` : ""
  }`

export const defaultConfig: RouteOptionsCreator = () => {
  return {
    apiBaseUrl: apiBaseUrl,
    kratosBrowserUrl: apiBaseUrl,
    faviconUrl: "favico.png",
    faviconType: "image/png",
    isOAuthConsentRouteEnabled: () =>
      (process.env.HYDRA_ADMIN_URL || process.env.ORY_SDK_URL) &&
      process.env.CSRF_COOKIE_SECRET &&
      process.env.CSRF_COOKIE_NAME
        ? true
        : false,
    shouldSkipConsent: (challenge) => {
      let trustedClients: string[] = []
      if (process.env.TRUSTED_CLIENT_IDS) {
        trustedClients = String(process.env.TRUSTED_CLIENT_IDS).split(",")
      }
      return challenge.skip ||
        challenge.client?.skip_consent ||
        (challenge.client?.client_id &&
          trustedClients.indexOf(challenge.client?.client_id) > -1)
        ? true
        : false
    },
    shouldSkipLogoutConsent: (challenge) => {
      return Boolean(
        (
          challenge.client as OAuth2LogoutRequest & {
            skip_logout_consent: boolean
          }
        )?.skip_logout_consent,
      )
    },
    ...sdk,
  }
}

export const isUUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export const isQuerySet = (x: any): x is string =>
  typeof x === "string" && x.length > 0

const isErrorAuthenticatorAssuranceLevel = (
  err: unknown,
): err is ErrorAuthenticatorAssuranceLevelNotSatisfied => {
  return (
    (err as ErrorAuthenticatorAssuranceLevelNotSatisfied).error?.id ==
    "session_aal2_required"
  )
}

// Redirects to the specified URL if the error is an AxiosError with a 404, 410,
// or 403 error code.
export const redirectOnSoftError =
  (res: Response, next: NextFunction, redirectTo: string) =>
  (err: AxiosError) => {
    if (!err.response) {
      next(err)
      return
    }

    if (err.response.status === 401) {
      // redirect to login
      const query = new URLSearchParams()
      query.set("return_to", redirectTo)
      res.redirect(getUrlForFlow(apiBaseUrl, "login", query))
      return
    }
    if (
      err.response.status === 404 ||
      err.response.status === 410 ||
      err.response.status === 403
    ) {
      // in some cases Kratos will require us to redirect to a different page when the session_aal2_required
      // for example, when recovery redirects us to settings
      // but settings requires us to redirect to login?aal=aal2
      const authenticatorAssuranceLevelError = err.response.data as unknown
      if (
        isErrorAuthenticatorAssuranceLevel(authenticatorAssuranceLevelError)
      ) {
        res.redirect(
          authenticatorAssuranceLevelError.redirect_browser_to || redirectTo,
        )
        return
      }
      res.redirect(`${redirectTo}`)
      return
    }

    next(err)
  }

export const handlebarsHelpers: UnknownObject = {
  jsonPretty: (context: any) => JSON.stringify(context, null, 2),
  onlyNodes: (
    nodes: UiNode[],
    groups: string[],
    attributes: string,
    withoutDefaultGroup?: boolean,
    withoutDefaultAttributes?: boolean,
  ) =>
    filterNodesByGroups({
      groups: groups,
      attributes: attributes,
      nodes: nodes,
      withoutDefaultAttributes,
      withoutDefaultGroup,
    }),
  divider: (fullWidth: boolean, className?: string) =>
    Divider({ className, fullWidth }),
  buttonLink: (text: string) =>
    ButtonLink({ href: "https://www.ory.sh/", children: text }),
  typography: (text: string, size: any, color: any, type?: any) =>
    Typography({
      children: text,
      type: type || "regular",
      size,
      color,
    }),
  menuLink: (
    text: string,
    url: string,
    iconLeft?: string,
    iconRight?: string,
  ) => {
    return MenuLink({
      href: url,
      iconLeft: iconLeft,
      iconRight: iconRight,
      children: text,
    })
  },
  oryBranding: () =>
    Typography({
      children: `Protected by `,
      type: "regular",
      size: "tiny",
      color: "foregroundSubtle",
    }),
}
