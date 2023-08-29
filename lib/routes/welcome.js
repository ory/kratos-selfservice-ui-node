"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWelcomeRoute = exports.createWelcomeRoute = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var pkg_1 = require("../pkg");
var ui_1 = require("../pkg/ui");
var createWelcomeRoute = function (createHelpers) { return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var frontend, session, return_to, logoutUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                res.locals.projectName = "Welcome to Ory";
                frontend = createHelpers(req, res).frontend;
                session = req.session;
                return_to = req.query.return_to;
                return [4 /*yield*/, frontend
                        .createBrowserLogoutFlow({
                        cookie: req.header("cookie"),
                        returnTo: (return_to && return_to.toString()) || "",
                    })
                        .catch(function () { return ({ data: { logout_url: "" } }); })];
            case 1:
                logoutUrl = (_a.sent()).data.logout_url || "";
                res.render("welcome", {
                    layout: "welcome",
                    nav: (0, ui_1.navigationMenu)({
                        navTitle: res.locals.projectName,
                        session: session,
                        logoutUrl: logoutUrl,
                        selectedLink: "welcome",
                    }),
                    projectInfoText: (0, elements_markup_1.Typography)({
                        children: "Your Ory Account Experience is running at ".concat(req.header("host"), "."),
                        type: "regular",
                        size: "small",
                        color: "foregroundMuted",
                    }),
                    concepts: [
                        (0, elements_markup_1.CardGradient)({
                            heading: "Getting Started",
                            content: "Jump start your project and complete the quickstart tutorial to get a broader overview of Ory Network.",
                            action: "https://www.ory.sh/docs/getting-started/integrate-auth/expressjs",
                            target: "_blank",
                        }),
                        (0, elements_markup_1.CardGradient)({
                            heading: "User flows",
                            content: "Implement flows that users perform themselves as opposed to administrative intervention.",
                            action: "https://www.ory.sh/docs/kratos/self-service",
                            target: "_blank",
                        }),
                        (0, elements_markup_1.CardGradient)({
                            heading: "Identities 101",
                            content: "Every identity can have its own model - get to know the ins and outs of Identity Schemas.",
                            action: "https://www.ory.sh/docs/kratos/manage-identities/identity-schema",
                            target: "_blank",
                        }),
                        (0, elements_markup_1.CardGradient)({
                            heading: "Sessions",
                            content: "Ory Network manages sessions for you - get to know how sessions work.",
                            action: "https://www.ory.sh/docs/kratos/session-management/overview",
                            target: "_blank",
                        }),
                        (0, elements_markup_1.CardGradient)({
                            heading: "Custom UI",
                            content: "Implementing these pages in your language and framework of choice is straightforward using our SDKs.",
                            action: "https://www.ory.sh/docs/kratos/bring-your-own-ui/configure-ory-to-use-your-ui",
                            target: "_blank",
                        }),
                    ].join("\n"),
                });
                return [2 /*return*/];
        }
    });
}); }; };
exports.createWelcomeRoute = createWelcomeRoute;
var registerWelcomeRoute = function (app, createHelpers, route) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    if (route === void 0) { route = "/welcome"; }
    app.get(route, (0, pkg_1.setSession)(createHelpers), (0, exports.createWelcomeRoute)(createHelpers));
};
exports.registerWelcomeRoute = registerWelcomeRoute;
