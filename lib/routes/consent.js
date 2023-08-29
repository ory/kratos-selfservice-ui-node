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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConsentPostRoute = exports.registerConsentRoute = exports.createConsentPostRoute = exports.createConsentRoute = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var body_parser_1 = __importDefault(require("body-parser"));
var csurf_1 = __importDefault(require("csurf"));
var pkg_1 = require("../pkg");
var _404_1 = require("./404");
var oidc_cert_1 = require("./stub/oidc-cert");
function createOAuth2ConsentRequestSession(grantScopes, consentRequest, identityApi) {
    return __awaiter(this, void 0, void 0, function () {
        var id_token, identity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id_token = {};
                    if (!(consentRequest.subject && grantScopes.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, identityApi.getIdentity({ id: consentRequest.subject })];
                case 1:
                    identity = (_a.sent()).data;
                    if (grantScopes.indexOf("email") > -1) {
                        // Client may check email of user
                        id_token.email = identity.traits["email"] || "";
                    }
                    if (grantScopes.indexOf("phone") > -1) {
                        // Client may check phone number of user
                        id_token.phone = identity.traits["phone"] || "";
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/, {
                        // This data will be available when introspecting the token. Try to avoid sensitive information here,
                        // unless you limit who can introspect tokens.
                        access_token: {
                        // foo: 'bar'
                        },
                        // This data will be available in the ID token.
                        id_token: id_token,
                    }];
            }
        });
    });
}
// A simple express handler that shows the Hydra consent screen.
var createConsentRoute = function (createHelpers) { return function (req, res, next) {
    console.log("createConsentRoute");
    res.locals.projectName = "An application requests access to your data!";
    var _a = createHelpers(req, res), oauth2 = _a.oauth2, identity = _a.identity;
    var consent_challenge = req.query.consent_challenge;
    // The challenge is used to fetch information about the consent request from ORY hydraAdmin.
    var challenge = String(consent_challenge);
    if (!challenge) {
        next(new Error("Expected a consent challenge to be set but received none."));
        return;
    }
    var trustedClients = [];
    if (process.env.TRUSTED_CLIENT_IDS) {
        trustedClients = String(process.env.TRUSTED_CLIENT_IDS).split(",");
    }
    console.log("getOAuth2ConsentRequest", challenge);
    // This section processes consent requests and either shows the consent UI or
    // accepts the consent request right away if the user has given consent to this
    // app before
    oauth2
        .getOAuth2ConsentRequest({ consentChallenge: challenge })
        // This will be called if the HTTP request was successful
        .then(function (_a) {
        var body = _a.data;
        return __awaiter(void 0, void 0, void 0, function () {
            var grantScope, session;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!(body.skip ||
                            ((_b = body.client) === null || _b === void 0 ? void 0 : _b.skip_consent) ||
                            (((_c = body.client) === null || _c === void 0 ? void 0 : _c.client_id) &&
                                trustedClients.indexOf((_d = body.client) === null || _d === void 0 ? void 0 : _d.client_id) > -1))) return [3 /*break*/, 2];
                        grantScope = body.requested_scope || [];
                        if (!Array.isArray(grantScope)) {
                            grantScope = [grantScope];
                        }
                        return [4 /*yield*/, createOAuth2ConsentRequestSession(grantScope, body, identity)
                            // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
                        ];
                    case 1:
                        session = _g.sent();
                        // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
                        return [2 /*return*/, oauth2
                                .acceptOAuth2ConsentRequest({
                                consentChallenge: challenge,
                                acceptOAuth2ConsentRequest: {
                                    // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
                                    // are requested accidentally.
                                    grant_scope: grantScope,
                                    // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
                                    grant_access_token_audience: body.requested_access_token_audience,
                                    // The session allows us to set session data for id and access tokens
                                    session: session,
                                },
                            })
                                .then(function (_a) {
                                var body = _a.data;
                                // All we need to do now is to redirect the user back to hydra!
                                res.redirect(String(body.redirect_to));
                            })];
                    case 2:
                        // If consent can't be skipped we MUST show the consent UI.
                        res.render("consent", {
                            card: (0, elements_markup_1.UserConsentCard)({
                                consent: body,
                                csrfToken: req.csrfToken(),
                                cardImage: ((_e = body.client) === null || _e === void 0 ? void 0 : _e.logo_uri) || "/ory-logo.svg",
                                client_name: ((_f = body.client) === null || _f === void 0 ? void 0 : _f.client_name) || "unknown client",
                                requested_scope: body.requested_scope,
                                client: body.client,
                                action: (process.env.BASE_URL || "") + "/consent",
                            }),
                        });
                        return [2 /*return*/];
                }
            });
        });
    })
        // This will handle any error that happens when making HTTP calls to hydra
        .catch(next);
    // The consent request has now either been accepted automatically or rendered.
}; };
exports.createConsentRoute = createConsentRoute;
var createConsentPostRoute = function (createHelpers) { return function (req, res, next) {
    // The challenge is a hidden input field, so we have to retrieve it from the request body
    var challenge = req.body.consent_challenge;
    var _a = createHelpers(req, res), oauth2 = _a.oauth2, identity = _a.identity;
    // Let's see if the user decided to accept or reject the consent request..
    if (req.body.submit === "Deny access") {
        // Looks like the consent request was denied by the user
        return (oauth2
            .rejectOAuth2ConsentRequest({
            consentChallenge: challenge,
            rejectOAuth2Request: {
                error: "access_denied",
                error_description: "The resource owner denied the request",
            },
        })
            .then(function (_a) {
            var body = _a.data;
            // All we need to do now is to redirect the browser back to hydra!
            res.redirect(String(body.redirect_to));
        })
            // This will handle any error that happens when making HTTP calls to hydra
            .catch(next));
    }
    var grantScope = req.body.grant_scope;
    if (!Array.isArray(grantScope)) {
        grantScope = [grantScope];
    }
    // Here is also the place to add data to the ID or access token. For example,
    // if the scope 'profile' is added, add the family and given name to the ID Token claims:
    // if (grantScope.indexOf('profile')) {
    //   session.id_token.family_name = 'Doe'
    //   session.id_token.given_name = 'John'
    // }
    // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
    oauth2
        .getOAuth2ConsentRequest({ consentChallenge: challenge })
        // This will be called if the HTTP request was successful
        .then(function (_a) {
        var body = _a.data;
        return __awaiter(void 0, void 0, void 0, function () {
            var session;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, createOAuth2ConsentRequestSession(grantScope, body, identity)];
                    case 1:
                        session = _b.sent();
                        return [2 /*return*/, oauth2
                                .acceptOAuth2ConsentRequest({
                                consentChallenge: challenge,
                                acceptOAuth2ConsentRequest: {
                                    // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
                                    // are requested accidentally.
                                    grant_scope: grantScope,
                                    // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
                                    // the app is built for the automated OpenID Connect Conformity Test Suite. You
                                    // can peak inside the code for some ideas, but be aware that all data is fake
                                    // and this only exists to fake a login system which works in accordance to OpenID Connect.
                                    //
                                    // If that variable is not set, the session will be used as-is.
                                    session: (0, oidc_cert_1.oidcConformityMaybeFakeSession)(grantScope, body, session),
                                    // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
                                    grant_access_token_audience: body.requested_access_token_audience,
                                    // This tells hydra to remember this consent request and allow the same client to request the same
                                    // scopes from the same user, without showing the UI, in the future.
                                    remember: Boolean(req.body.remember),
                                    // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
                                    remember_for: process.env.REMEMBER_CONSENT_FOR_SECONDS
                                        ? Number(process.env.REMEMBER_CONSENT_SESSION_FOR_SECONDS)
                                        : 3600,
                                },
                            })
                                .then(function (_a) {
                                var body = _a.data;
                                // All we need to do now is to redirect the user back!
                                res.redirect(String(body.redirect_to));
                            })];
                }
            });
        });
    })
        .catch(next);
}; };
exports.createConsentPostRoute = createConsentPostRoute;
// Sets up csrf protection
var csrfProtection = (0, csurf_1.default)({
    cookie: {
        sameSite: "lax",
    },
});
var parseForm = body_parser_1.default.urlencoded({ extended: false });
var registerConsentRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    if (process.env.HYDRA_ADMIN_URL) {
        console.log("found HYDRA_ADMIN_URL");
        return app.get("/consent", csrfProtection, (0, exports.createConsentRoute)(createHelpers));
    }
    else {
        return _404_1.register404Route;
    }
};
exports.registerConsentRoute = registerConsentRoute;
var registerConsentPostRoute = function (app, createHelpers) {
    if (createHelpers === void 0) { createHelpers = pkg_1.defaultConfig; }
    if (process.env.HYDRA_ADMIN_URL) {
        return app.post("/consent", parseForm, csrfProtection, (0, exports.createConsentPostRoute)(createHelpers));
    }
    else {
        return _404_1.register404Route;
    }
};
exports.registerConsentPostRoute = registerConsentPostRoute;
