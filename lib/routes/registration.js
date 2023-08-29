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
exports.registerRegistrationRoute = exports.createRegistrationRoute = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var ui_1 = require("@ory/integrations/ui");
var pkg_1 = require("../pkg");
// A simple express handler that shows the registration screen.
var createRegistrationRoute = function (createHelpers) { return function (req, res, next) {
    res.locals.projectName = "Create account";
    var _a = req.query, flow = _a.flow, return_to = _a.return_to, after_verification_return_to = _a.after_verification_return_to, login_challenge = _a.login_challenge;
    var _b = createHelpers(req, res), frontend = _b.frontend, kratosBrowserUrl = _b.kratosBrowserUrl, logoUrl = _b.logoUrl;
    var initFlowQuery = new URLSearchParams(__assign(__assign({}, (return_to && { return_to: return_to.toString() })), (after_verification_return_to && {
        after_verification_return_to: after_verification_return_to.toString(),
    })));
    if ((0, pkg_1.isQuerySet)(login_challenge)) {
        pkg_1.logger.debug("login_challenge found in URL query: ", { query: req.query });
        initFlowQuery.append("login_challenge", login_challenge);
    }
    else {
        pkg_1.logger.debug("no login_challenge found in URL query: ", {
            query: req.query,
        });
    }
    var initFlowUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "registration", initFlowQuery);
    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!(0, pkg_1.isQuerySet)(flow)) {
        pkg_1.logger.debug("No flow ID found in URL query initializing login flow", {
            query: req.query,
        });
        res.redirect(303, initFlowUrl);
        return;
    }
    frontend
        .getRegistrationFlow({ id: flow, cookie: req.header("Cookie") })
        .then(function (_a) {
        var _b, _c, _d;
        var flow = _a.data;
        // Render the data using a view (e.g. Jade Template):
        var initLoginQuery = new URLSearchParams({
            return_to: (return_to && return_to.toString()) || flow.return_to || "",
        });
        if ((_b = flow.oauth2_login_request) === null || _b === void 0 ? void 0 : _b.challenge) {
            initLoginQuery.set("login_challenge", flow.oauth2_login_request.challenge);
        }
        res.render("registration", {
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
                .filter(function (onClickAction) { return !!onClickAction; }),
            card: (0, elements_markup_1.UserAuthCard)(__assign(__assign({ title: "Register an account", flow: flow }, (flow.oauth2_login_request && {
                subtitle: "To authenticate ".concat(((_c = flow.oauth2_login_request.client) === null || _c === void 0 ? void 0 : _c.client_name) ||
                    ((_d = flow.oauth2_login_request.client) === null || _d === void 0 ? void 0 : _d.client_id)),
            })), { flowType: "registration", cardImage: logoUrl, additionalProps: {
                    loginURL: (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "login", initLoginQuery),
                } })),
        });
    })
        .catch((0, pkg_1.redirectOnSoftError)(res, next, initFlowUrl));
}; };
exports.createRegistrationRoute = createRegistrationRoute;
var registerRegistrationRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    app.get("/registration", (0, pkg_1.requireNoAuth)(createHelpers), (0, exports.createRegistrationRoute)(createHelpers));
};
exports.registerRegistrationRoute = registerRegistrationRoute;
