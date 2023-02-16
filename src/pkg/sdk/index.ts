// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  Configuration,
  FrontendApi,
  IdentityApi,
  OAuth2Api,
  PermissionApi,
} from "@ory/client"

const baseUrlInternal =
  process.env.ORY_SDK_URL || "https://playground.projects.oryapis.com"

const apiBaseFrontendUrl = process.env.KRATOS_PUBLIC_URL || baseUrlInternal

const apiBaseIdentityUrl = process.env.KRATOS_ADMIN_URL || baseUrlInternal

const apiBaseOauth2UrlInternal = process.env.HYDRA_ADMIN_URL || baseUrlInternal

const apiBasePermissionsUrlInternal =
  process.env.KETO_READ_URL || baseUrlInternal

const kratosBrowserUrl = process.env.KRATOS_BROWSER_URL || apiBaseFrontendUrl

const hydraBaseOptions: any = {}

if (process.env.MOCK_TLS_TERMINATION) {
  hydraBaseOptions.headers = { "X-Forwarded-Proto": "https" }
}

const baseConfig = new Configuration({
  basePath: apiBaseFrontendUrl,
})

const frontendConfig = new Configuration({
  ...baseConfig,
})

const identityConfig = new Configuration({
  ...baseConfig,
  basePath: apiBaseIdentityUrl,
})

const permissionsConfig = new Configuration({
  ...baseConfig,
  basePath: apiBasePermissionsUrlInternal,
})

const oauth2Config = new Configuration({
  ...baseConfig,
  basePath: apiBaseOauth2UrlInternal,
  baseOptions: hydraBaseOptions,
})

// Sets up the SDK
const sdk = {
  kratosBrowserUrl,
  frontend: new FrontendApi(frontendConfig),
  oauth2: new OAuth2Api(oauth2Config),
  permissions: new PermissionApi(permissionsConfig),
  identity: new IdentityApi(identityConfig),
}

export default sdk
