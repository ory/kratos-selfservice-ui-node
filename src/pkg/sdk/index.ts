// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { Configuration, FrontendApi, OAuth2Api, IdentityApi } from "@ory/client"

const apiBaseUrlInternal =
  process.env.KRATOS_PUBLIC_URL ||
  process.env.ORY_SDK_URL ||
  "https://playground.projects.oryapis.com"

export const apiBaseUrl = process.env.KRATOS_BROWSER_URL || apiBaseUrlInternal

const hydraBaseOptions: any = {}

if (process.env.MOCK_TLS_TERMINATION) {
  hydraBaseOptions.headers = { "X-Forwarded-Proto": "https" }
}

const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
    // accessToken: process.env.ORY_API_KEY || process.env.ORY_PAT,
    baseOptions: hydraBaseOptions,
  }),
)

const config = new Configuration({
  basePath: apiBaseUrlInternal,
  // accessToken: "Your Ory Cloud API Key / Personal Access Token"
})

// Sets up the SDK
const sdk = {
  identity: new IdentityApi(config),
  basePath: apiBaseUrlInternal,
  frontend: new FrontendApi(config),
  // accessToken: "Your Ory Cloud API Key / Personal Access Token"
  oauth2: new OAuth2Api(config),
}

export default sdk
