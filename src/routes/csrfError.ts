// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { logger } from "../pkg"
import { Request, Response, NextFunction } from "express"

// Error handling, validation error interception
export const csrfErrorHandler =
  (invalidCsrfTokenError: unknown) =>
  (error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (error == invalidCsrfTokenError) {
      logger.debug("The CSRF token is invalid or could not be found.", {
        req: req,
      })
      next(
        new Error(
          "A security violation was detected, please fill out the form again.",
        ),
      )
    } else {
      next()
    }
  }
