// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { RouteRegistrator } from "../pkg"
import { UserErrorCard } from "@ory/elements-markup"
import { NextFunction, Request, Response } from "express"

export const register500Route: RouteRegistrator = (app, createHelpers) => {
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err, err.stack)
    res.status(500).render("error", {
      card: UserErrorCard({
        title: "Internal Server Error",
        cardImage: createHelpers?.(req, res).logoUrl,
        backUrl: req.header("Referer") || "welcome",
        error: {
          id: "backend-error",
          error: {
            ...err,
          },
        },
      }),
    })
  })
}
