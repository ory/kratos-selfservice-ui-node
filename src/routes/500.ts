import { RouteRegistrator } from "../pkg"
import { NextFunction, Request, Response } from "express"

export const register500Route: RouteRegistrator = (app) => {
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).render("error", {
      message: JSON.stringify(err, null, 2),
    })
  })
}
