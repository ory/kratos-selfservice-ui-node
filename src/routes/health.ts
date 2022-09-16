import { defaultConfig, removeTrailingSlash, RouteRegistrator } from "../pkg"
import { Request, Response } from "express"

export const registerHealthRoute: RouteRegistrator = (app) => {
  app.get("/health/alive", (_: Request, res: Response) => res.send("ok"))
  app.get("/health/ready", (_: Request, res: Response) => res.send("ok"))
}
