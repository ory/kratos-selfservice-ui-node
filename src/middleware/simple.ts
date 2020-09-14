// This middleware uses ORY Krato's `/sessions/whoami` endpoint to check if the user is signed in or not:
//
//   import express from 'express'
//   import protect from './middleware/simple.ts'
//
//   const app = express()
//
//   app.get("/dashboard", protect, (req, res) => { /* ... */ })

import {PublicApi} from "@oryd/kratos-client";
import config from "../config";
import {NextFunction, Request, Response} from "express";
import urljoin from "url-join";

const sdk = new PublicApi(
  config.kratos.public // In the quickstart: `http://127.0.0.1:4433/`
)

export default (req: Request, res: Response, next: NextFunction) => {
  // When using ORY Oathkeeper, the redirection is done by ORY Oathkeeper.
  // Since we're checking for the session ourselves here, we redirect here
  // if the session is invalid.
  req.headers['host'] = config.kratos.public.split('/')[2]

  // We override the TypeScript type because:
  // - `whoami` does expect a simple string map, not IncomingHttpHeaders.
  // - `express-session` does not properly type `req`.
  const r = req as Request & { user: any } & { headers: { [name: string]: string } }

  sdk.whoami(r).then(({body}) => {
    // `whoami` returns the session or an error
    r.user = {session: body}
    next()
  }).catch(() => {
    // If no session is found, redirect to login.
    res.redirect(urljoin(config.baseUrl, '/auth/login'))
  })
}
