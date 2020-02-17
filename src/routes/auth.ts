import {NextFunction, Request, Response} from 'express'
import config from '../config'
import {sortFormFields} from '../translations'
import {
  AdminApi,
  FormField,
  LoginRequest,
  RegistrationRequest,
} from '@oryd/kratos-client'
import {IncomingMessage} from 'http'

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

  // The request is used to identify the login and registration request and
  // return data like the csrf_token and so on.
  if (!request) {
    console.log('No request found in URL, initializing auth flow.')
    res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}`)
    return
  }

  const authRequest: Promise<{
    response: IncomingMessage
    body?: LoginRequest | RegistrationRequest
  }> =
    type === 'login'
      ? adminEndpoint.getSelfServiceBrowserLoginRequest(request)
      : adminEndpoint.getSelfServiceBrowserRegistrationRequest(request)

  authRequest
    .then(({body, response}) => {
      if (response.statusCode == 404) {
        res.redirect(
          `${config.kratos.browser}/self-service/browser/flows/${type}`
        )
        return
      } else if (response.statusCode != 200) {
        return Promise.reject(body)
      }

      return body
    })
    .then((request?: LoginRequest | RegistrationRequest) => {
      if (!request) {
        res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}`)
        return
      }

      const formFields = request.methods.password.config?.fields.sort(sortFormFields)
      const action = request.methods.password.config?.action
      const errors = request.methods.password.config?.errors

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
