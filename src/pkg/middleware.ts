import { AxiosError } from 'axios'
import { NextFunction, Request, Response } from 'express'

import { getUrlForFlow } from './index'
import { RouteOptionsCreator } from './route'

export const setSession =
  (createHelpers: RouteOptionsCreator) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { sdk, apiBaseUrl } = createHelpers(req)
    sdk
      .toSession(undefined, req.header('cookie'))
      .then(({ data: session }) => {
        req.session = session
        next()
      })
      .catch((err: AxiosError) => {
        // 403 on toSession means that we need to request 2FA
        if (err.response && err.response.status === 403) {
          res.redirect(
            getUrlForFlow(
              apiBaseUrl,
              'login',
              new URLSearchParams({ aal: 'aal2' })
            )
          )
          return
        }
        next()
      })
  }

export const requireUnauth =
  (createHelpers: RouteOptionsCreator) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { sdk } = createHelpers(req)
    sdk
      .toSession(undefined, req.header('cookie'))
      .then(() => {
        res.redirect('welcome')
      })
      .catch(() => {
        next()
      })
  }

export const requireAuth =
  (createHelpers: RouteOptionsCreator) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { sdk, apiBaseUrl } = createHelpers(req)
    sdk
      .toSession(undefined, req.header('cookie'))
      .then(({ data: session }) => {
        // `whoami` returns the session or an error. We're changing the type here
        // because express-session is not detected by TypeScript automatically.
        req.session = session
        next()
      })
      .catch((err: AxiosError) => {
        // 403 on toSession means that we need to request 2FA
        if (err.response && err.response.status === 403) {
          res.redirect(
            getUrlForFlow(
              apiBaseUrl,
              'login',
              new URLSearchParams([['aal', 'aal2']])
            )
          )
          return
        }
        // If no session is found, redirect to login.
        res.redirect(getUrlForFlow(apiBaseUrl, 'login'))
      })
  }
