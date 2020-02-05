import { NextFunction, Request, Response } from 'express'
import config from './config'
import { sortFormFields } from './translations'
import {
  AdminApi,
  FormField,
  LoginRequest,
  RegistrationRequest,
} from '@oryd/kratos-client'

// A simple express handler that shows the login / registration screen.
// Argument "type" can either be "login" or "registration" and will
// fetch the form data from ORY Kratos's Public API.
const adminEndpoint = new AdminApi(config.kratos.admin)

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

  const authRequest: Promise<{
    response: any
    body?: LoginRequest | RegistrationRequest
  }> =
    type === 'login'
      ? adminEndpoint.getSelfServiceBrowserLoginRequest(request)
      : adminEndpoint.getSelfServiceBrowserRegistrationRequest(request)

  authRequest
    .then(({ body, response }) => {
      if (response.status == 404) {
        res.redirect(
          `${config.kratos.browser}/self-service/browser/flows/${type}`
        )
        return
      } else if (response.status != 200) {
        return Promise.reject(body)
      }

      return body
    })
    .then((request?: LoginRequest | RegistrationRequest) => {
      // would be nice to have optional chaining ;)
      const fields: Array<FormField> | undefined = request
        ? request.methods
          ? request.methods.password
            ? request.methods.password.config
              ? 'fields' in request.methods.password.config
                ? request.methods.password.config['fields']
                : undefined
              : undefined
            : undefined
          : undefined
        : undefined
      const action = request
        ? request.methods
          ? request.methods.password
            ? request.methods.password.config
              ? 'action' in request.methods.password.config
                ? request.methods.password.config['action']
                : undefined
              : undefined
            : undefined
          : undefined
        : undefined
      const errors = request
        ? request.methods
          ? request.methods.password
            ? request.methods.password.config
              ? 'errors' in request.methods.password.config
                ? request.methods.password.config['errors']
                : undefined
              : undefined
            : undefined
          : undefined
        : undefined

      const formFields = fields
        ? (fields as Array<FormField>).sort(sortFormFields)
        : []

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
