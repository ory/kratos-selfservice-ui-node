"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthRoute = void 0;
var registerHealthRoute = function (app) {
    app.get("/health/alive", function (_, res) { return res.send("ok"); });
    app.get("/health/ready", function (_, res) { return res.send("ok"); });
};
exports.registerHealthRoute = registerHealthRoute;
