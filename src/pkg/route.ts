// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  FrontendApi,
  FrontendApiInterface,
  OAuth2ApiInterface,
} from "@ory/client"
import { Application, NextFunction, Request, Response } from "express"

export interface RouteOptions {
  frontend: FrontendApi
  apiBaseUrl: string
  kratosBrowserUrl: string
  logo?: string
}

export type RouteOptionsCreator = (req: Request) => RouteOptions

export type RouteCreator = (
  opts: RouteOptionsCreator,
) => (req: Request, res: Response, next: NextFunction) => void

export type RouteRegistrator = (
  app: Application,
  createHelpers?: RouteOptionsCreator,
  route?: string,
) => void
