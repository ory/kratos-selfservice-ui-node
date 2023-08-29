"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireNoAuth = exports.setSession = exports.addFavicon = exports.requireAuth = void 0;
var index_1 = require("./index");
/**
 * Checks the error returned by toSession() and initiates a 2FA flow if necessary
 * or returns false.
 *
 * @internal
 * @param res
 * @param apiBaseUrl
 */
var maybeInitiate2FA = function (req, res, apiBaseUrl) { return function (err) {
    // 403 on toSession means that we need to request 2FA
    if (err.response && err.response.status === 403) {
        res.redirect((0, index_1.getUrlForFlow)(apiBaseUrl, "login", new URLSearchParams({ aal: "aal2", return_to: req.url.toString() })));
        return true;
    }
    return false;
}; };
/**
 * Adds the session to the request object.
 *
 * @param req
 */
var addSessionToRequest = function (req) {
    return function (_a) {
        var session = _a.data;
        // `whoami` returns the session or an error. We're changing the type here
        // because express-session is not detected by TypeScript automatically.
        req.session = session;
    };
};
/**
 * This middleware requires that the HTTP request has a session.
 * If the session is not present, it will redirect to the login flow.
 *
 * If a session is set but 403 is returned, a 2FA flow will be initiated.
 *
 * @param createHelpers
 */
var requireAuth = function (createHelpers) {
    return function (req, res, next) {
        var _a = createHelpers(req, res), frontend = _a.frontend, apiBaseUrl = _a.apiBaseUrl;
        // when accessing settings with a valid flow id
        // we allow the settings page to trigger the
        // login flow on session_aal2_required
        if (req.url.includes("/settings") && req.query.flow) {
            if (index_1.isUUID.test(req.query.flow.toString())) {
                next();
                return;
            }
        }
        frontend
            .toSession({ cookie: req.header("cookie") })
            .then(addSessionToRequest(req))
            .then(function () { return next(); })
            .catch(function (err) {
            if (!maybeInitiate2FA(req, res, apiBaseUrl)(err)) {
                res.redirect((0, index_1.getUrlForFlow)(apiBaseUrl, "login"));
                return;
            }
        });
    };
};
exports.requireAuth = requireAuth;
var addFavicon = function (createHelpers) {
    return function (req, res, next) {
        var _a = createHelpers(req, res), faviconUrl = _a.faviconUrl, faviconType = _a.faviconType;
        res.locals.faviconUrl = faviconUrl;
        res.locals.faviconType = faviconType;
        next();
    };
};
exports.addFavicon = addFavicon;
/**
 * Sets the session in the request. If no session is found,
 * the request still succeeds.
 *
 * If a session is set but 403 is returned, a 2FA flow will be initiated.
 *
 * @param createHelpers
 */
var setSession = function (createHelpers) {
    return function (req, res, next) {
        var _a = createHelpers(req, res), frontend = _a.frontend, apiBaseUrl = _a.apiBaseUrl;
        frontend
            .toSession({ cookie: req.header("cookie") })
            .then(addSessionToRequest(req))
            .catch(maybeInitiate2FA(req, res, apiBaseUrl))
            .then(function () { return next(); });
    };
};
exports.setSession = setSession;
/**
 * This middleware requires that the HTTP request has no session.
 * If the session is present, it will redirect to the home page.
 *
 * @param createHelpers
 */
var requireNoAuth = function (createHelpers) {
    return function (req, res, next) {
        var frontend = createHelpers(req, res).frontend;
        frontend
            .toSession({ cookie: req.header("cookie") })
            .then(function () {
            res.redirect("welcome");
        })
            .catch(function () {
            next();
        });
    };
};
exports.requireNoAuth = requireNoAuth;
