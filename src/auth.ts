import { Config } from 'types'
import { NextFunction, Request, Response } from 'express'
import config from './config'
import fetch from 'node-fetch'

// A simple express handler that shows the login / registration screen.
// Argument "type" can either be "login" or "registration" and will
// fetch the form data from ORY Kratos's Public API.
export const authHandler = (type: 'login' | 'registration') => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const request = req.query.request

  // The request is used to identify the login and registraion request and
  // return data like the csrf_token and so on.
  if (!request) {
    console.log('No request found in URL, initializing auth flow.')
    res.redirect(`${config.kratos.browser}/auth/browser/${type}`)
    return
  }

  // This is the ORY Kratos URL. If this app and ORY Kratos are running
  // on the same (e.g. Kubernetes) cluster, this should be ORY Kratos's internal hostname.
  const url = new URL(`${config.kratos.public}/auth/browser/requests/${type}`)
  url.searchParams.set('request', request)

  fetch(url.toString())
    .then(response => {
      if (response.status == 404) {
        res.redirect(`${config.kratos.browser}/auth/browser/${type}`)
        return
      }

      return response.json()
    })
    .then((request: Config) => {
      const {
        methods: {
          password: {
            config: {
              fields: {
                csrf_token: { value: csrf_token = '' } = {},
                identifier: { value: identifier = '' } = {},
                'traits.email': { value: email = '' } = {},
              } = {},
              action,
              errors,
            },
          },
        },
      } = request

      res.render(type, {
        formAction: action,
        csrfToken: csrf_token,
        identifier: identifier,
        email: email,
        errors,
      })
    })
    .catch(err => next(err))
}
