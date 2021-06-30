// This middleware uses ORY Krato's `/sessions/whoami` endpoint to check if the user is signed in or not:
//
//   import express from 'express'
//   import protect from './middleware/simple.ts'
//
//   const app = express()
//
//   app.get("/dashboard", protect, (req, res) => { /* ... */ })

import { Configuration, PublicApi } from '@ory/kratos-client'
import config from '../config'
import { NextFunction, Request, Response } from 'express'
import urljoin from 'url-join'

const kratos = new PublicApi(
  new Configuration({ basePath: config.kratos.public })
)

export default (req: Request, res: Response, next: NextFunction) => {
  kratos
    .toSession(undefined, req.cookies['ory_kratos_session'])
    .then(({ data: session }) => {
      // `whoami` returns the session or an error. We're changing the type here
      // because express-session is not detected by TypeScript automatically.
      ;(req as Request & { user: any }).user = { session }
      next()
    })
    .catch(() => {
      // If no session is found, redirect to login.
      res.redirect(urljoin(config.baseUrl, '/auth/login'))
    })
}
