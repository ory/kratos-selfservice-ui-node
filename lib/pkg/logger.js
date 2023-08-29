"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.logger = void 0;
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
var express_winston_1 = __importDefault(require("express-winston"));
var winston_1 = __importDefault(require("winston"));
var config = {
    format: winston_1.default.format.json(),
    transports: [new winston_1.default.transports.Console()],
};
exports.logger = winston_1.default.createLogger(config);
exports.middleware = express_winston_1.default.logger({ winstonInstance: exports.logger });
