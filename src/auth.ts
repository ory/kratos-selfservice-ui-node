import { Config } from 'types'
import { NextFunction, Request, Response } from 'express'
import config from './config'
import fetch from 'node-fetch'
import { sortFormFields } from './translations'

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
    res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}`)
    return
  }

  // This is the ORY Kratos URL. If this app and ORY Kratos are running
  // on the same (e.g. Kubernetes) cluster, this should be ORY Kratos's internal hostname.
  const url = new URL(`${config.kratos.admin}/self-service/browser/flows/requests/${type}`)
  url.searchParams.set('request', request)

  fetch(url.toString())
    .then(response => {
      if (response.status == 404) {
        res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}`)
        return
      } else if (response.status != 200) {
        return response.json().then(body => Promise.reject(body))
      }

      return response.json()
    })
    .then((request: Config) => {
      const {
        methods: {
          password: {
            config: { fields = {}, action, errors },
          },
        },
      } = request

      const formFields = Object.values(fields).sort(sortFormFields)

      res.render(type, {
        formAction: action,
        formFields,
        errors,
      })
    })
    .catch(err => {
      console.error(err)
      next(err)
    })
}
