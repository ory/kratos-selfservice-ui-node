"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRecoveryRoute = exports.createRecoveryRoute = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var pkg_1 = require("../pkg");
var createRecoveryRoute = function (createHelpers) { return function (req, res, next) {
    res.locals.projectName = "Recover account";
    var _a = req.query, flow = _a.flow, _b = _a.return_to, return_to = _b === void 0 ? "" : _b;
    var _c = createHelpers(req, res), frontend = _c.frontend, kratosBrowserUrl = _c.kratosBrowserUrl, logoUrl = _c.logoUrl, faviconUrl = _c.faviconUrl, faviconType = _c.faviconType;
    res.locals.faviconUrl = faviconUrl;
    res.locals.faviconType = faviconType;
    var initFlowUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "recovery", new URLSearchParams({ return_to: return_to.toString() }));
    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!(0, pkg_1.isQuerySet)(flow)) {
        pkg_1.logger.debug("No flow ID found in URL query initializing login flow", {
            query: req.query,
        });
        res.redirect(303, initFlowUrl);
        return;
    }
    return frontend
        .getRecoveryFlow({ id: flow, cookie: req.header("cookie") })
        .then(function (_a) {
        var flow = _a.data;
        var initLoginUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "login", new URLSearchParams({
            return_to: (return_to && return_to.toString()) || flow.return_to || "",
        }));
        res.render("recovery", {
            card: (0, elements_markup_1.UserAuthCard)({
                title: "Recover your account",
                flow: flow,
                flowType: "recovery",
                cardImage: logoUrl,
                additionalProps: {
                    loginURL: initLoginUrl,
                },
            }),
        });
    })
        .catch((0, pkg_1.redirectOnSoftError)(res, next, initFlowUrl));
}; };
exports.createRecoveryRoute = createRecoveryRoute;
var registerRecoveryRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    app.get("/recovery", (0, pkg_1.requireNoAuth)(createHelpers), (0, exports.createRecoveryRoute)(createHelpers));
};
exports.registerRecoveryRoute = registerRecoveryRoute;
