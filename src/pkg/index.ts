import { AxiosError } from "axios"
import { NextFunction, Response } from "express"

import { RouteOptionsCreator } from "./route"
import sdk, { apiBaseUrl } from "./sdk"

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
    sdk,
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
