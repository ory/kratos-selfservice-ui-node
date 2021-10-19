import { AxiosError } from 'axios'

import {
  defaultConfig,
  isQuerySet,
  removeTrailingSlash,
  requireAuth,
  RouteCreator,
  RouteRegistrator
} from '../pkg'

import { createSettingsRoute } from './settings'

// A simple express handler that shows the error screen.
export const createErrorRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = 'An error occurred'
    const { id } = req.query

    // Get the SDK
    const { sdk } = createHelpers(req)

    if (!isQuerySet(id)) {
      // No error was send, redirecting back to home.
      res.redirect('welcome')
      return
    }

    sdk
      .getSelfServiceError(id)
      .then(({ data: body }) => {
        res.status(500).render('error', {
          message: JSON.stringify(body.error, null, 2)
        })
      })
      .catch((err: AxiosError) => {
        if (!err.response) {
          next(err)
          return
        }

        if (err.response.status === 404) {
          // The error could not be found, redirect back to home.
          res.redirect('welcome')
          return
        }

        next(err)
      })
  }

export const registerErrorRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig
) => {
  app.get('/error', createErrorRoute(createHelpers))
}
