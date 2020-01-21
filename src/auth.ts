import {Config} from 'types'
import {NextFunction, Request, Response} from 'express'
import config from './config'
import fetch from 'node-fetch'
import getTranslation from "./translations";

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
              fields = {},
              action,
              errors,
            },
          },
        },
      } = request
      console.log(fields)

      // inject hidden and title key
      const formFields = Object.fromEntries(Object.entries(fields).map(([key, value]: [string, { [key: string]: any }]) => ([key, {
        ...value,
        ...{
          isHidden: 'type' in value && value.type === 'hidden',
          isPassword: 'type' in value && value.type === 'password',
          title: 'name' in value ? getTranslation(value.name, value.name) : ''
        },
      }])))
      res.render(type, {
        formAction: action,
        formFields,
        errors,
      })
    })
    .catch(err => next(err))
}
