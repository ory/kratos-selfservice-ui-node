// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { logger, RouteRegistrator } from "../pkg"
import { UserErrorCard } from "@ory/elements-markup"
import { format } from "@redtea/format-axios-error"
import { NextFunction, Request, Response } from "express"

function formatRequest(req: Request) {
  return {
    headers: req.headers,
    method: req.method,
    url: req.url,
    httpVersion: req.httpVersion,
    body: req.body,
    cookies: "[Redacted]",
    path: req.path,
    protocol: req.protocol,
    query: req.query,
    hostname: req.hostname,
    ip: req.ip,
    originalUrl: req.originalUrl,
    params: req.params,
  }
}

export const register500Route: RouteRegistrator = (app, createHelpers) => {
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let jsonError: string = ""
    try {
      const formattedError = format(err)

      logger.error("An error occurred", {
        error: formattedError,
        req: formatRequest(req),
      })
      delete (formattedError as any).config
      delete (formattedError as any).isAxiosError
      jsonError = JSON.stringify(formattedError)
    } catch (e) {
      // This shouldn't happen, as the try block should not throw an error.
      // But if it does, we log it and render the Error card with a generic error message.
      // If this is removed, the server will crash if the error is not serializable.
      logger.error("An error occurred while serializing the error", {
        error: err,
        req: formatRequest(req),
      })
    }
    res.status(500).render("error", {
      card: UserErrorCard({
        title: "Internal Server Error",
        cardImage: createHelpers?.(req, res).logoUrl,
        backUrl: req.header("Referer") || "welcome",
        error: {
          id: "interal_server_error",
          error: {
            message:
              "An internal server error occurred. Please try again later.",
            debug: JSON.parse(jsonError),
          },
        },
      }),
    })
  })
}
