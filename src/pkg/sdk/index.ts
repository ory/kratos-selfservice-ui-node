// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { Configuration, FrontendApi, IdentityApi, OAuth2Api } from "@ory/client"

const apiBaseUrlInternal =
  process.env.KRATOS_PUBLIC_URL ||
  process.env.ORY_SDK_URL ||
  "https://playground.projects.oryapis.com"

export const apiBaseUrl = process.env.KRATOS_BROWSER_URL || apiBaseUrlInternal

const config = new Configuration({
  basePath: apiBaseUrlInternal,
  // accessToken: "Your Ory Cloud API Key / Personal Access Token"
})

// Sets up the SDK
const sdk = {
  identity: new IdentityApi(config),
  frontend: new FrontendApi(config),
  oauth2: new OAuth2Api(config),
}

export default sdk
