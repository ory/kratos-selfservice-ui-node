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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLoginRoute = exports.createLoginRoute = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var ui_1 = require("@ory/integrations/ui");
var path_1 = __importDefault(require("path"));
var url_1 = require("url");
var pkg_1 = require("../pkg");
var createLoginRoute = function (createHelpers) { return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, flow, _b, aal, _c, refresh, _d, return_to, login_challenge, _e, frontend, kratosBrowserUrl, logoUrl, initFlowQuery, initFlowUrl, getLogoutUrl, redirectToVerificationFlow;
    return __generator(this, function (_f) {
        res.locals.projectName = "Sign in";
        _a = req.query, flow = _a.flow, _b = _a.aal, aal = _b === void 0 ? "" : _b, _c = _a.refresh, refresh = _c === void 0 ? "" : _c, _d = _a.return_to, return_to = _d === void 0 ? "" : _d, login_challenge = _a.login_challenge;
        _e = createHelpers(req, res), frontend = _e.frontend, kratosBrowserUrl = _e.kratosBrowserUrl, logoUrl = _e.logoUrl;
        initFlowQuery = new url_1.URLSearchParams({
            aal: aal.toString(),
            refresh: refresh.toString(),
            return_to: return_to.toString(),
        });
        if ((0, pkg_1.isQuerySet)(login_challenge)) {
            pkg_1.logger.debug("login_challenge found in URL query: ", { query: req.query });
            initFlowQuery.append("login_challenge", login_challenge);
        }
        initFlowUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "login", initFlowQuery);
        // The flow is used to identify the settings and registration flow and
        // return data like the csrf_token and so on.
        if (!(0, pkg_1.isQuerySet)(flow)) {
            pkg_1.logger.debug("No flow ID found in URL query initializing login flow", {
                query: req.query,
            });
            res.redirect(303, initFlowUrl);
            return [2 /*return*/];
        }
        getLogoutUrl = function (loginFlow) { return __awaiter(void 0, void 0, void 0, function () {
            var logoutUrl, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logoutUrl = "";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, frontend
                                .createBrowserLogoutFlow({
                                cookie: req.header("cookie"),
                                returnTo: (return_to && return_to.toString()) || loginFlow.return_to || "",
                            })
                                .then(function (_a) {
                                var data = _a.data;
                                return data.logout_url;
                            })];
                    case 2:
                        logoutUrl = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        pkg_1.logger.error("Unable to create logout URL", { error: err_1 });
                        return [3 /*break*/, 5];
                    case 4: return [2 /*return*/, logoutUrl];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        redirectToVerificationFlow = function (loginFlow) {
            // we will create a new verification flow and redirect the user to the verification page
            frontend
                .createBrowserVerificationFlow({
                returnTo: (return_to && return_to.toString()) || loginFlow.return_to || "",
            })
                .then(function (_a) {
                var headers = _a.headers, verificationFlow = _a.data;
                // we need the csrf cookie from the verification flow
                res.setHeader("set-cookie", headers["set-cookie"]);
                // encode the verification flow id in the query parameters
                var verificationParameters = new url_1.URLSearchParams({
                    flow: verificationFlow.id,
                    message: JSON.stringify(loginFlow.ui.messages),
                });
                var baseUrl = req.path.split("/");
                // get rid of the last part of the path (e.g. "login")
                baseUrl.pop();
                // redirect to the verification page with the custom message
                res.redirect(303, 
                // join the base url with the verification path
                path_1.default.join(req.baseUrl, "verification?" + verificationParameters.toString()));
            })
                .catch((0, pkg_1.redirectOnSoftError)(res, next, (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "verification", new url_1.URLSearchParams({
                return_to: (return_to && return_to.toString()) ||
                    loginFlow.return_to ||
                    "",
            }))));
        };
        return [2 /*return*/, frontend
                .getLoginFlow({ id: flow, cookie: req.header("cookie") })
                .then(function (_a) {
                var flow = _a.data;
                return __awaiter(void 0, void 0, void 0, function () {
                    var initRegistrationQuery, initRecoveryUrl, initRegistrationUrl, logoutUrl;
                    var _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                if (flow.ui.messages && flow.ui.messages.length > 0) {
                                    // the login requires that the user verifies their email address before logging in
                                    if (flow.ui.messages.some(function (_a) {
                                        var id = _a.id;
                                        return id === 4000010;
                                    })) {
                                        // we will create a new verification flow and redirect the user to the verification page
                                        return [2 /*return*/, redirectToVerificationFlow(flow)];
                                    }
                                }
                                initRegistrationQuery = new url_1.URLSearchParams({
                                    return_to: (return_to && return_to.toString()) || flow.return_to || "",
                                });
                                if ((_b = flow.oauth2_login_request) === null || _b === void 0 ? void 0 : _b.challenge) {
                                    initRegistrationQuery.set("login_challenge", flow.oauth2_login_request.challenge);
                                }
                                initRecoveryUrl = "";
                                initRegistrationUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "registration", initRegistrationQuery);
                                if (!flow.refresh) {
                                    initRecoveryUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "recovery", new url_1.URLSearchParams({
                                        return_to: (return_to && return_to.toString()) || flow.return_to || "",
                                    }));
                                }
                                logoutUrl = "";
                                if (!(flow.requested_aal === "aal2" || flow.refresh)) return [3 /*break*/, 2];
                                return [4 /*yield*/, getLogoutUrl(flow)];
                            case 1:
                                logoutUrl = _e.sent();
                                _e.label = 2;
                            case 2:
                                res.render("login", {
                                    nodes: flow.ui.nodes,
                                    webAuthnHandler: (0, ui_1.filterNodesByGroups)({
                                        nodes: flow.ui.nodes,
                                        groups: ["webauthn"],
                                        attributes: ["button"],
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
                                    card: (0, elements_markup_1.UserAuthCard)(__assign(__assign({ title: flow.refresh
                                            ? "Confirm it's you"
                                            : flow.requested_aal === "aal2"
                                                ? "Two-Factor Authentication"
                                                : "Sign In" }, (flow.oauth2_login_request && {
                                        subtitle: "To authenticate ".concat(((_c = flow.oauth2_login_request.client) === null || _c === void 0 ? void 0 : _c.client_name) ||
                                            ((_d = flow.oauth2_login_request.client) === null || _d === void 0 ? void 0 : _d.client_id)),
                                    })), { flow: flow, flowType: "login", cardImage: logoUrl, additionalProps: {
                                            forgotPasswordURL: initRecoveryUrl,
                                            signupURL: initRegistrationUrl,
                                            logoutURL: logoutUrl,
                                        } })),
                                });
                                return [2 /*return*/];
                        }
                    });
                });
            })
                .catch((0, pkg_1.redirectOnSoftError)(res, next, initFlowUrl))];
    });
}); }; };
exports.createLoginRoute = createLoginRoute;
var registerLoginRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    app.get("/login", (0, exports.createLoginRoute)(createHelpers));
};
exports.registerLoginRoute = registerLoginRoute;
