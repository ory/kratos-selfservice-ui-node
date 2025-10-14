import { Session } from "@ory/client"
import "express"

declare module "express" {
  export interface Request {
    session?: Session
    csrfToken?: (overwrite?: boolean) => string
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: any // or define a proper type for your JWT payload
  }
}