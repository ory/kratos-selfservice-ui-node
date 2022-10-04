import { Session } from "@ory/client"

declare module "express" {
  export interface Request {
    session?: Session
    basePath?: string
  }
}
