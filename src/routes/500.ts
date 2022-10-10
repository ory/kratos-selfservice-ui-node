import { UserErrorCard } from "@ory/elements-markup"
import { NextFunction, Request, Response } from "express"
import { RouteRegistrator } from "../pkg"

export const register500Route: RouteRegistrator = (app) => {
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const basePath = req.app.locals.basePath

    console.error(err.stack)
    res.status(500).render("error", {
      card: UserErrorCard({
        title: "Internal Server Error",
        cardImage: (basePath ? `/${basePath}` : "") + "/ory-logo.svg",
        backURL: basePath || "/",
        error: {
          id: "404",
          error: {
            ...err,
            code: 500,
          },
        },
      }),
    })
  })
}
