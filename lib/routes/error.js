"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerErrorRoute = exports.createErrorRoute = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var pkg_1 = require("../pkg");
// A simple express handler that shows the error screen.
var createErrorRoute = function (createHelpers) { return function (req, res, next) {
    res.locals.projectName = "An error occurred";
    var id = req.query.id;
    // Get the SDK
    var _a = createHelpers(req, res), frontend = _a.frontend, logoUrl = _a.logoUrl;
    if (!(0, pkg_1.isQuerySet)(id)) {
        // No error was send, redirecting back to home.
        res.redirect("welcome");
        return;
    }
    frontend
        .getFlowError({ id: id })
        .then(function (_a) {
        var data = _a.data;
        res.status(200).render("error", {
            card: (0, elements_markup_1.UserErrorCard)({
                error: data,
                cardImage: logoUrl,
                title: "An error occurred",
                backUrl: req.header("Referer") || "welcome",
            }),
        });
    })
        .catch(function (err) {
        if (!err.response) {
            next(err);
            return;
        }
        if (err.response.status === 404) {
            // The error could not be found, redirect back to home.
            res.redirect("welcome");
            return;
        }
        next(err);
    });
}; };
exports.createErrorRoute = createErrorRoute;
var registerErrorRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    app.get("/error", (0, exports.createErrorRoute)(createHelpers));
};
exports.registerErrorRoute = registerErrorRoute;
