"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStaticRoutes = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var express_1 = __importDefault(require("express"));
var pkg_1 = require("../pkg");
var sdk_1 = __importDefault(require("../pkg/sdk"));
var registerStaticRoutes = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    (0, elements_markup_1.RegisterOryElementsExpress)(app, elements_markup_1.defaultLightTheme, createHelpers);
    app.use("/", express_1.default.static("public"));
    app.use("/.well-known/ory/webauthn.js", function (req, res) {
        res.contentType("text/javascript");
        sdk_1.default.frontend.getWebAuthnJavaScript().then(function (_a) {
            var data = _a.data;
            res.send(data);
        });
    });
    app.use("/", express_1.default.static("node_modules/@ory/elements-markup/dist/"));
};
exports.registerStaticRoutes = registerStaticRoutes;
