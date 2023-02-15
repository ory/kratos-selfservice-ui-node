// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { FrontendApi, OAuth2Api } from "@ory/client"
import { Theme } from "@ory/elements-markup"
import { NextFunction, Request, Response, Router } from "express"

export interface RouteOptions {
  frontend: FrontendApi
  oauth2: OAuth2Api
  apiBaseUrl: string
  kratosBrowserUrl: string
  logoUrl?: string
  theme?: Theme
}

export type RouteOptionsCreator = (req: Request, res: Response) => RouteOptions

export type RouteCreator = (
  opts: RouteOptionsCreator,
) => (req: Request, res: Response, next: NextFunction) => void

export type RouteRegistrator = (
  router: Router,
  createHelpers?: RouteOptionsCreator,
  route?: string,
) => void
