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
exports.registerSessionsRoute = exports.createSessionsRoute = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var elements_markup_1 = require("@ory/elements-markup");
var pkg_1 = require("../pkg");
var ui_1 = require("../pkg/ui");
var createSessionsRoute = function (createHelpers) { return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var frontend, session, logoutUrl, identityCredentialTrait, sessionText;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                res.locals.projectName = "Session Information";
                frontend = createHelpers(req, res).frontend;
                session = req.session;
                return [4 /*yield*/, frontend
                        .createBrowserLogoutFlow({ cookie: req.header("cookie") })
                        .catch(function () { return ({ data: { logout_url: "" } }); })];
            case 1:
                logoutUrl = (_b.sent()).data.logout_url || "";
                identityCredentialTrait = (session === null || session === void 0 ? void 0 : session.identity.traits.email) || (session === null || session === void 0 ? void 0 : session.identity.traits.username) || "";
                sessionText = identityCredentialTrait !== ""
                    ? " and you are currently logged in as ".concat(identityCredentialTrait, " ")
                    : "";
                res.render("session", {
                    layout: "welcome",
                    sessionInfoText: (0, elements_markup_1.Typography)({
                        children: "Your browser holds an active Ory Session for ".concat(req.header("host")).concat(sessionText, "- changing properties inside Acount Settings will be reflected in the decoded Ory Session."),
                        size: "small",
                        color: "foregroundMuted",
                    }),
                    traits: __assign(__assign(__assign(__assign({ id: session === null || session === void 0 ? void 0 : session.identity.id }, Object.entries(session === null || session === void 0 ? void 0 : session.identity.traits).reduce(function (traits, _a) {
                        var key = _a[0], value = _a[1];
                        traits[key] =
                            typeof value === "object" ? JSON.stringify(value) : value;
                        return traits;
                    }, {})), { "signup date": (session === null || session === void 0 ? void 0 : session.identity.created_at) || "", "authentication level": (session === null || session === void 0 ? void 0 : session.authenticator_assurance_level) === "aal2"
                            ? "two-factor used (aal2)"
                            : "single-factor used (aal1)" }), ((session === null || session === void 0 ? void 0 : session.expires_at) && {
                        "session expires at": new Date(session === null || session === void 0 ? void 0 : session.expires_at).toUTCString(),
                    })), ((session === null || session === void 0 ? void 0 : session.authenticated_at) && {
                        "session authenticated at": new Date(session === null || session === void 0 ? void 0 : session.authenticated_at).toUTCString(),
                    })),
                    // map the session's authentication level to a human readable string
                    // this produces a list of objects
                    authMethods: (_a = session === null || session === void 0 ? void 0 : session.authentication_methods) === null || _a === void 0 ? void 0 : _a.reduce(function (methods, method, i) {
                        var _a;
                        methods.push((_a = {},
                            _a["authentication method used"] = "".concat(method.method, " (").concat(method.completed_at && new Date(method.completed_at).toUTCString(), ")"),
                            _a));
                        return methods;
                    }, []),
                    sessionCodeBox: (0, elements_markup_1.CodeBox)({
                        className: "session-code-box",
                        children: JSON.stringify(session, null, 2),
                    }),
                    nav: (0, ui_1.navigationMenu)({
                        navTitle: res.locals.projectName,
                        session: session,
                        logoutUrl: logoutUrl,
                        selectedLink: "sessions",
                    }),
                });
                return [2 /*return*/];
        }
    });
}); }; };
exports.createSessionsRoute = createSessionsRoute;
var registerSessionsRoute = function (app, createHelpers, route) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    if (route === void 0) { route = "/sessions"; }
    app.get(route, (0, pkg_1.requireAuth)(createHelpers), (0, exports.createSessionsRoute)(createHelpers));
};
exports.registerSessionsRoute = registerSessionsRoute;
