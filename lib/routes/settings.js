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
exports.registerSettingsRoute = exports.createSettingsRoute = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var ui_1 = require("@ory/integrations/ui");
var pkg_1 = require("../pkg");
var createSettingsRoute = function (createHelpers) { return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, flow, _b, return_to, helpers, frontend, kratosBrowserUrl, initFlowUrl, session, identityCredentialTrait, sessionText;
    return __generator(this, function (_c) {
        res.locals.projectName = "Account settings";
        _a = req.query, flow = _a.flow, _b = _a.return_to, return_to = _b === void 0 ? "" : _b;
        helpers = createHelpers(req, res);
        frontend = helpers.frontend, kratosBrowserUrl = helpers.kratosBrowserUrl;
        initFlowUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "settings", new URLSearchParams({ return_to: return_to.toString() }));
        // The flow is used to identify the settings and registration flow and
        // return data like the csrf_token and so on.
        if (!(0, pkg_1.isQuerySet)(flow)) {
            pkg_1.logger.debug("No flow ID found in URL query initializing login flow", {
                query: req.query,
            });
            res.redirect(303, initFlowUrl);
            return [2 /*return*/];
        }
        session = req.session;
        identityCredentialTrait = (session === null || session === void 0 ? void 0 : session.identity.traits.email) || (session === null || session === void 0 ? void 0 : session.identity.traits.username) || "";
        sessionText = identityCredentialTrait !== ""
            ? "You are currently logged in as ".concat(identityCredentialTrait, " ")
            : "";
        return [2 /*return*/, frontend
                .getSettingsFlow({ id: flow, cookie: req.header("cookie") })
                .then(function (_a) {
                var flow = _a.data;
                return __awaiter(void 0, void 0, void 0, function () {
                    var logoutUrl, conditionalLinks;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, frontend
                                    .createBrowserLogoutFlow({
                                    cookie: req.header("cookie"),
                                    returnTo: (return_to && return_to.toString()) || flow.return_to || "",
                                })
                                    .then(function (_a) {
                                    var data = _a.data;
                                    return data.logout_url;
                                })
                                    .catch(function () { return ""; })];
                            case 1:
                                logoutUrl = (_b.sent()) || "";
                                conditionalLinks = [
                                    {
                                        name: "Profile",
                                        href: "#profile",
                                        iconLeft: "user",
                                        testId: "profile",
                                    },
                                    (0, elements_markup_1.hasPassword)(flow.ui.nodes) && {
                                        name: "Password",
                                        href: "#password",
                                        iconLeft: "lock",
                                        testId: "password",
                                    },
                                    (0, elements_markup_1.hasOidc)(flow.ui.nodes) && {
                                        name: "Social Sign In",
                                        href: "#oidc",
                                        iconLeft: "comments",
                                        testId: "social-sign-in",
                                    },
                                    (0, elements_markup_1.hasLookupSecret)(flow.ui.nodes) && {
                                        name: "2FA Backup Codes",
                                        href: "#lookupSecret",
                                        iconLeft: "shield",
                                        testId: "backup-codes",
                                    },
                                    (0, elements_markup_1.hasWebauthn)(flow.ui.nodes) && {
                                        name: "Hardware Tokens",
                                        href: "#webauthn",
                                        iconLeft: "key",
                                        testId: "webauthn",
                                    },
                                    (0, elements_markup_1.hasTotp)(flow.ui.nodes) && {
                                        name: "Authenticator App",
                                        href: "#totp",
                                        iconLeft: "mobile",
                                        testId: "totp",
                                    },
                                ].filter(Boolean);
                                // Render the data using a view (e.g. Jade Template):
                                res.render("settings", {
                                    layout: "settings",
                                    nav: (0, elements_markup_1.Nav)({
                                        className: "main-nav",
                                        navTitle: res.locals.projectName,
                                        navSections: [
                                            {
                                                links: conditionalLinks,
                                            },
                                            {
                                                links: [
                                                    {
                                                        name: "Logout",
                                                        href: logoutUrl,
                                                        iconLeft: "arrow-right-to-bracket",
                                                        testId: "logout",
                                                    },
                                                ],
                                            },
                                        ],
                                    }),
                                    nodes: flow.ui.nodes,
                                    errorMessages: (0, elements_markup_1.NodeMessages)({
                                        uiMessages: flow.ui.messages,
                                        textPosition: "start",
                                    }),
                                    sessionDescription: [
                                        sessionText !== "" &&
                                            (0, elements_markup_1.Typography)({
                                                children: sessionText,
                                                color: "foregroundMuted",
                                                size: "small",
                                            }),
                                        (0, elements_markup_1.Typography)({
                                            children: "Here you can manage settings related to your account. Keep in mind that certain actions require you to re-authenticate.",
                                            color: "foregroundMuted",
                                            size: "small",
                                        }),
                                    ]
                                        .filter(Boolean)
                                        .join(""),
                                    webAuthnHandler: (0, ui_1.filterNodesByGroups)({
                                        nodes: flow.ui.nodes,
                                        groups: "webauthn",
                                        attributes: "button",
                                        withoutDefaultAttributes: true,
                                        withoutDefaultGroup: true,
                                    })
                                        .filter(function (_a) {
                                        var attributes = _a.attributes;
                                        return (0, ui_1.isUiNodeInputAttributes)(attributes);
                                    })
                                        .map(function (_a) {
                                        var attributes = _a.attributes;
                                        return attributes.onclick;
                                    })
                                        .filter(function (c) { return c !== undefined; }),
                                    settingsCard: function (flowType) {
                                        var card = (0, elements_markup_1.UserSettingsCard)({
                                            flow: flow,
                                            flowType: flowType,
                                        });
                                        if (card) {
                                            return ("<div class=\"spacing-32\" id=\"".concat(flowType, "\">") +
                                                card +
                                                (0, elements_markup_1.Divider)({ className: "divider-left", fullWidth: false }) +
                                                "</div>");
                                        }
                                        return "";
                                    },
                                });
                                return [2 /*return*/];
                        }
                    });
                });
            })
                .catch((0, pkg_1.redirectOnSoftError)(res, next, initFlowUrl))];
    });
}); }; };
exports.createSettingsRoute = createSettingsRoute;
var registerSettingsRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    app.get("/settings", (0, pkg_1.requireAuth)(createHelpers), (0, exports.createSettingsRoute)(createHelpers));
};
exports.registerSettingsRoute = registerSettingsRoute;
