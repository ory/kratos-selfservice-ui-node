"use strict";
// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./404"), exports);
__exportStar(require("./500"), exports);
__exportStar(require("./error"), exports);
__exportStar(require("./health"), exports);
__exportStar(require("./login"), exports);
__exportStar(require("./consent"), exports);
__exportStar(require("./recovery"), exports);
__exportStar(require("./registration"), exports);
__exportStar(require("./sessions"), exports);
__exportStar(require("./settings"), exports);
__exportStar(require("./static"), exports);
__exportStar(require("./verification"), exports);
__exportStar(require("./welcome"), exports);
