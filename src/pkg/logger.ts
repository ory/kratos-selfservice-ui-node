// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import expressWinston from "express-winston"
import winston from "winston"

let format: winston.Logform.Format = winston.format.json()
if (process.env.NODE_ENV === "development") {
  format = winston.format.combine(
    winston.format.simple(),
    winston.format.colorize({
      all: true,
      colors: {
        info: "blue",
        error: "red",
        warn: "yellow",
      },
    }),
  )
}

const config = {
  format: winston.format.combine(winston.format.timestamp(), format),
  transports: [new winston.transports.Console()],
}
export const logger = winston.createLogger(config)
export const middleware = expressWinston.logger({
  winstonInstance: logger,
  ignoreRoute: (req) => req.url.startsWith("/assets"),
  ignoredRoutes: [
    "/theme.css",
    "/main.css",
    "/content-layout.css",
    "/style.css",
    "/ory-small.svg",
    "/ory-logo.svg",
    "/favico.png",
    "/health/ready",
    "/health/alive",
    "/auth-layout.css",
  ],
})
