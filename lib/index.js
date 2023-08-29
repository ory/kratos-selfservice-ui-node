"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var express_1 = __importDefault(require("express"));
var express_handlebars_1 = require("express-handlebars");
var fs = __importStar(require("fs"));
var https = __importStar(require("https"));
var pkg_1 = require("./pkg");
var logger_1 = require("./pkg/logger");
var routes_1 = require("./routes");
var baseUrl = process.env.BASE_PATH || "/";
var app = (0, express_1.default)();
var router = express_1.default.Router();
app.use(logger_1.middleware);
app.use((0, cookie_parser_1.default)());
app.use((0, pkg_1.addFavicon)(pkg_1.defaultConfig));
app.set("view engine", "hbs");
app.engine("hbs", (0, express_handlebars_1.engine)({
    extname: "hbs",
    layoutsDir: "".concat(__dirname, "/../views/layouts/"),
    partialsDir: "".concat(__dirname, "/../views/partials/"),
    defaultLayout: "auth",
    helpers: pkg_1.handlebarsHelpers,
}));
(0, routes_1.registerHealthRoute)(router);
(0, routes_1.registerLoginRoute)(router);
(0, routes_1.registerConsentRoute)(app);
(0, routes_1.registerConsentPostRoute)(app);
(0, routes_1.registerRecoveryRoute)(router);
(0, routes_1.registerRegistrationRoute)(router);
(0, routes_1.registerSettingsRoute)(router);
(0, routes_1.registerVerificationRoute)(router);
(0, routes_1.registerSessionsRoute)(router);
(0, routes_1.registerWelcomeRoute)(router);
(0, routes_1.registerErrorRoute)(router);
router.get("/", function (req, res) {
    res.redirect(303, "welcome");
});
(0, routes_1.registerStaticRoutes)(router);
(0, routes_1.register404Route)(router);
(0, routes_1.register500Route)(router);
app.use(baseUrl, router);
var port = Number(process.env.PORT) || 3000;
var listener = function (proto) { return function () {
    console.log("Listening on ".concat(proto, "://0.0.0.0:").concat(port));
}; };
if (((_a = process.env.TLS_CERT_PATH) === null || _a === void 0 ? void 0 : _a.length) && ((_b = process.env.TLS_KEY_PATH) === null || _b === void 0 ? void 0 : _b.length)) {
    var options = {
        cert: fs.readFileSync(process.env.TLS_CERT_PATH),
        key: fs.readFileSync(process.env.TLS_KEY_PATH),
    };
    https.createServer(options, app).listen(port, listener("https"));
}
else {
    app.listen(port, listener("http"));
}
