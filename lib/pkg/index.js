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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlebarsHelpers = exports.redirectOnSoftError = exports.isQuerySet = exports.isUUID = exports.defaultConfig = exports.getUrlForFlow = exports.removeTrailingSlash = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var ui_1 = require("@ory/integrations/ui");
var sdk_1 = __importStar(require("./sdk"));
var ui_2 = require("./ui");
__exportStar(require("./logger"), exports);
__exportStar(require("./middleware"), exports);
__exportStar(require("./route"), exports);
var removeTrailingSlash = function (s) { return s.replace(/\/$/, ""); };
exports.removeTrailingSlash = removeTrailingSlash;
var getUrlForFlow = function (base, flow, query) {
    return "".concat((0, exports.removeTrailingSlash)(base), "/self-service/").concat(flow, "/browser").concat(query ? "?".concat(query.toString()) : "");
};
exports.getUrlForFlow = getUrlForFlow;
var defaultConfig = function () {
    return __assign({ apiBaseUrl: sdk_1.apiBaseUrl, kratosBrowserUrl: sdk_1.apiBaseUrl, faviconUrl: "favico.png", faviconType: "image/png" }, sdk_1.default);
};
exports.defaultConfig = defaultConfig;
exports.isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
var isQuerySet = function (x) {
    return typeof x === "string" && x.length > 0;
};
exports.isQuerySet = isQuerySet;
var isErrorAuthenticatorAssuranceLevel = function (err) {
    var _a;
    return (((_a = err.error) === null || _a === void 0 ? void 0 : _a.id) ==
        "session_aal2_required");
};
// Redirects to the specified URL if the error is an AxiosError with a 404, 410,
// or 403 error code.
var redirectOnSoftError = function (res, next, redirectTo) {
    return function (err) {
        if (!err.response) {
            next(err);
            return;
        }
        if (err.response.status === 404 ||
            err.response.status === 410 ||
            err.response.status === 403) {
            // in some cases Kratos will require us to redirect to a different page when the session_aal2_required
            // for example, when recovery redirects us to settings
            // but settings requires us to redirect to login?aal=aal2
            var authenticatorAssuranceLevelError = err.response.data;
            if (isErrorAuthenticatorAssuranceLevel(authenticatorAssuranceLevelError)) {
                res.redirect(authenticatorAssuranceLevelError.redirect_browser_to || redirectTo);
                return;
            }
            res.redirect("".concat(redirectTo));
            return;
        }
        next(err);
    };
};
exports.redirectOnSoftError = redirectOnSoftError;
exports.handlebarsHelpers = {
    jsonPretty: function (context) { return JSON.stringify(context, null, 2); },
    onlyNodes: function (nodes, groups, attributes, withoutDefaultGroup, withoutDefaultAttributes) {
        return (0, ui_1.filterNodesByGroups)({
            groups: groups,
            attributes: attributes,
            nodes: nodes,
            withoutDefaultAttributes: withoutDefaultAttributes,
            withoutDefaultGroup: withoutDefaultGroup,
        });
    },
    toUiNodePartial: ui_2.toUiNodePartial,
    getNodeLabel: ui_1.getNodeLabel,
    divider: function (fullWidth, className) {
        return (0, elements_markup_1.Divider)({ className: className, fullWidth: fullWidth });
    },
    buttonLink: function (text) {
        return (0, elements_markup_1.ButtonLink)({ href: "https://www.ory.sh/", children: text });
    },
    typography: function (text, size, color, type) {
        return (0, elements_markup_1.Typography)({
            children: text,
            type: type || "regular",
            size: size,
            color: color,
        });
    },
    menuLink: function (text, url, iconLeft, iconRight) {
        return (0, elements_markup_1.MenuLink)({
            href: url,
            iconLeft: iconLeft,
            iconRight: iconRight,
            children: text,
        });
    },
    oryBranding: function () {
        return (0, elements_markup_1.Typography)({
            children: "Protected by ",
            type: "regular",
            size: "tiny",
            color: "foregroundSubtle",
        });
    },
};
