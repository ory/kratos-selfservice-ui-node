import { Request, Response } from 'express'

import {
  defaultConfig,
  removeTrailingSlash,
  RouteCreator,
  RouteRegistrator,
  setSession
} from '../pkg'

export const createWelcomeRoute: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    res.locals.projectName = 'Welcome to Ory'

    const { sdk, getFormActionUrl } = createHelpers(req)
    const session = req.session

    // Create a logout URL
    const logoutUrl = getFormActionUrl(
      (
        await sdk
          .createSelfServiceLogoutFlowUrlForBrowsers(req.header('cookie'))
          .catch(() => ({ data: { logout_url: '' } }))
      ).data.logout_url || ''
    )

    res.render('welcome', {
      session: session
        ? JSON.stringify(session, null, 2)
        : `No valid Ory Session was found.
Please sign in to receive one.`,
      hasSession: Boolean(session),
      logoutUrl
    })
  }

export const registerWelcomeRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  basePath = '/'
) => {
  app.get(
    removeTrailingSlash(basePath) + '/welcome',
    setSession(createHelpers),
    createWelcomeRoute(createHelpers)
  )
  app.get(
    removeTrailingSlash(basePath) + '/',
    (req: Request, res: Response) => {
      res.redirect(removeTrailingSlash(basePath) + '/welcome')
    }
  )
}
