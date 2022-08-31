import { Request, Response } from "express"

import { RouteRegistrator } from "../pkg"

export const registerHealthRoute: RouteRegistrator = (app) => {
  app.get("/health/alive", (_: Request, res: Response) => res.send("ok"))
  app.get("/health/ready", (_: Request, res: Response) => res.send("ok"))
}
