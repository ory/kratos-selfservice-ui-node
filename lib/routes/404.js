"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register404Route = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var register404Route = function (app, createHelpers) {
    app.get("*", function (req, res) {
        res.status(404).render("error", {
            card: (0, elements_markup_1.UserErrorCard)({
                title: "404 - Page not found",
                cardImage: createHelpers === null || createHelpers === void 0 ? void 0 : createHelpers(req, res).logoUrl,
                backUrl: "sessions",
                error: {
                    id: "404",
                    error: {
                        reason: "The requested page could not be found (404).",
                        code: 404,
                    },
                },
            }),
        });
    });
};
exports.register404Route = register404Route;
