// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { Configuration, FrontendApi, IdentityApi, OAuth2Api } from "@ory/client"

const baseUrlInternal =
  process.env.ORY_SDK_URL || "https://playground.projects.oryapis.com"

const apiBaseFrontendUrlInternal =
  process.env.KRATOS_PUBLIC_URL || baseUrlInternal

const apiBaseOauth2UrlInternal = process.env.HYDRA_ADMIN_URL || baseUrlInternal

const apiBaseIdentityUrl = process.env.KRATOS_ADMIN_URL || baseUrlInternal

export const apiBaseUrl =
  process.env.KRATOS_BROWSER_URL || apiBaseFrontendUrlInternal

// Sets up the SDK
const sdk = {
  basePath: apiBaseFrontendUrlInternal,
  frontend: new FrontendApi(
    new Configuration({
      basePath: apiBaseFrontendUrlInternal,
    }),
  ),
  oauth2: new OAuth2Api(
    new Configuration({
      basePath: apiBaseOauth2UrlInternal,
      ...(process.env.ORY_ADMIN_API_TOKEN && {
        accessToken: process.env.ORY_ADMIN_API_TOKEN,
      }),
      ...(process.env.MOCK_TLS_TERMINATION && {
        baseOptions: {
          "X-Forwarded-Proto": "https",
        },
      }),
    }),
  ),
  identity: new IdentityApi(
    new Configuration({
      basePath: apiBaseIdentityUrl,
      ...(process.env.ORY_ADMIN_API_TOKEN && {
        accessToken: process.env.ORY_ADMIN_API_TOKEN,
      }),
    }),
  ),
}

export default sdk
