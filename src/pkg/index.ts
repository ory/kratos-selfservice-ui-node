// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { UiNode } from "@ory/client"
import { Typography, Divider, ButtonLink, MenuLink } from "@ory/elements-markup"
import { filterNodesByGroups, getNodeLabel } from "@ory/integrations/ui"
import { AxiosError } from "axios"
import { NextFunction, Response } from "express"
import { RouteOptionsCreator } from "./route"
import sdk, { apiBaseUrl } from "./sdk"
import { toUiNodePartial } from "./ui"

export * from "./middleware"
export * from "./route"
export * from "./logger"

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
    ...sdk,
  }
}

export const isQuerySet = (x: any): x is string =>
  typeof x === "string" && x.length > 0

// Redirects to the specified URL if the error is an AxiosError with a 404, 410,
// or 403 error code.
export const redirectOnSoftError =
  (res: Response, next: NextFunction, redirectTo: string) =>
  (err: AxiosError) => {
    if (!err.response) {
      next(err)
      return
    }

    if (
      err.response.status === 404 ||
      err.response.status === 410 ||
      err.response.status === 403
    ) {
      res.redirect(`${redirectTo}`)
      return
    }

    next(err)
  }

export const handlebarsHelpers = {
  ...require("handlebars-helpers")(),
  jsonPretty: (context: any) => JSON.stringify(context, null, 2),
  onlyNodes: (
    nodes: Array<UiNode>,
    groups: string,
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
  toUiNodePartial,
  getNodeLabel: getNodeLabel,
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
      children: "",
      type: "regular",
      size: "tiny",
      color: "foregroundSubtle",
    }),
}
