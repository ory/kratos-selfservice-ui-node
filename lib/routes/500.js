"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register500Route = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var register500Route = function (app, createHelpers) {
    app.use(function (err, req, res, next) {
        console.error(err, err.stack);
        res.status(500).render("error", {
            card: (0, elements_markup_1.UserErrorCard)({
                title: "Internal Server Error",
                cardImage: createHelpers === null || createHelpers === void 0 ? void 0 : createHelpers(req, res).logoUrl,
                backUrl: req.header("Referer") || "welcome",
                error: {
                    id: "backend-error",
                    error: __assign({}, err),
                },
            }),
        });
    });
};
exports.register500Route = register500Route;
