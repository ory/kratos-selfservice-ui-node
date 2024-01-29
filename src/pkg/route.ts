// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  FrontendApi,
  IdentityApi,
  OAuth2Api,
  OAuth2ConsentRequest,
  OAuth2LogoutRequest,
} from "@ory/client"
import { Theme } from "@ory/elements-markup"
import { NextFunction, Request, Response, Router } from "express"

export interface RouteOptions {
  frontend: FrontendApi
  oauth2: OAuth2Api
  identity: IdentityApi
  apiBaseUrl: string
  kratosBrowserUrl: string

  // Checks if OAuth2 consent route is enabled
  // This is used to determine if the consent route should be registered
  // We need to check if the required environment variables are set
  isOAuthConsentRouteEnabled: () => boolean

  // Checks if the OAuth2 consent request should be skipped
  // In some cases Hydra will let us skip the consent request
  // Setting `TRUSTED_CLIENT_IDS` will skip the consent request for the given client ids
  shouldSkipConsent: (challenge: OAuth2ConsentRequest) => boolean

  // When this returns true, the logout screen will not be shown.
  shouldSkipLogoutConsent: (challenge: OAuth2LogoutRequest) => boolean

  logoUrl?: string
  faviconUrl?: string
  faviconType?: string
  theme?: Theme
  extraPartials?: {
    login: () => string
    registration: () => string
  }
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
