"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiBaseUrl = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var client_1 = require("@ory/client");
var baseUrlInternal = process.env.ORY_SDK_URL || "https://playground.projects.oryapis.com";
var apiBaseFrontendUrlInternal = process.env.KRATOS_PUBLIC_URL || baseUrlInternal;
var apiBaseOauth2UrlInternal = process.env.HYDRA_ADMIN_URL || baseUrlInternal;
var apiBaseIdentityUrl = process.env.KRATOS_ADMIN_URL || baseUrlInternal;
exports.apiBaseUrl = process.env.KRATOS_BROWSER_URL || apiBaseFrontendUrlInternal;
var hydraBaseOptions = {};
if (process.env.MOCK_TLS_TERMINATION) {
    hydraBaseOptions.headers = { "X-Forwarded-Proto": "https" };
}
// Sets up the SDK
var sdk = {
    basePath: apiBaseFrontendUrlInternal,
    frontend: new client_1.FrontendApi(new client_1.Configuration({
        basePath: apiBaseFrontendUrlInternal,
    })),
    oauth2: new client_1.OAuth2Api(new client_1.Configuration({
        basePath: apiBaseOauth2UrlInternal,
        baseOptions: hydraBaseOptions,
    })),
    identity: new client_1.IdentityApi(new client_1.Configuration({
        basePath: apiBaseIdentityUrl,
    })),
};
exports.default = sdk;
