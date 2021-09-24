import { V0alpha2Api } from '@ory/client'
import { Application, NextFunction, Request, Response } from 'express'

export interface RouteOptions {
  sdk: V0alpha2Api
  basePath: string
  apiBaseUrl: string
  kratosBrowserUrl: string
  baseUrlWithoutTrailingSlash?: string
  getFormActionUrl: (url: string) => string
}

export type RouteOptionsCreator = (req: Request) => RouteOptions

export type RouteCreator = (
  opts: RouteOptionsCreator
) => (req: Request, res: Response, next: NextFunction) => void

export type RouteRegistrator = (
  app: Application,
  createHelpers?: RouteOptionsCreator,
  basePath?: string
) => void
