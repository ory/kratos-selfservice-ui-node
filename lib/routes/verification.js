"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVerificationRoute = exports.createVerificationRoute = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var pkg_1 = require("../pkg");
var createVerificationRoute = function (createHelpers) { return function (req, res, next) {
    res.locals.projectName = "Verify account";
    var _a = req.query, flow = _a.flow, _b = _a.return_to, return_to = _b === void 0 ? "" : _b, message = _a.message;
    var _c = createHelpers(req, res), frontend = _c.frontend, kratosBrowserUrl = _c.kratosBrowserUrl, logoUrl = _c.logoUrl;
    var initFlowUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "verification", new URLSearchParams({ return_to: return_to.toString() }));
    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!(0, pkg_1.isQuerySet)(flow)) {
        pkg_1.logger.debug("No flow ID found in URL query initializing login flow", {
            query: req.query,
        });
        res.redirect(303, initFlowUrl);
        return;
    }
    return (frontend
        .getVerificationFlow({ id: flow, cookie: req.header("cookie") })
        .then(function (_a) {
        var flow = _a.data;
        var initRegistrationUrl = (0, pkg_1.getUrlForFlow)(kratosBrowserUrl, "registration", new URLSearchParams({
            return_to: (return_to && return_to.toString()) || flow.return_to || "",
        }));
        // check for custom messages in the query string
        if ((0, pkg_1.isQuerySet)(message)) {
            var m = JSON.parse(message);
            // add them to the flow data so they can be rendered by the UI
            flow.ui.messages = __spreadArray(__spreadArray([], (flow.ui.messages || []), true), m, true);
        }
        // Render the data using a view (e.g. Jade Template):
        res.render("verification", {
            card: (0, elements_markup_1.UserAuthCard)({
                title: "Verify your account",
                flow: flow,
                flowType: "verification",
                cardImage: logoUrl,
                additionalProps: {
                    signupURL: initRegistrationUrl,
                },
            }),
        });
    })
        // Handle errors using ExpressJS' next functionality:
        .catch((0, pkg_1.redirectOnSoftError)(res, next, initFlowUrl)));
}; };
exports.createVerificationRoute = createVerificationRoute;
var registerVerificationRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    app.get("/verification", (0, exports.createVerificationRoute)(createHelpers));
};
exports.registerVerificationRoute = registerVerificationRoute;
