import {AuthConfig} from 'types'
import {NextFunction, Request, Response} from 'express'
import config from './config'
import fetch from 'node-fetch'
import {sortFormFields} from './translations'
import {withResource} from "./helpers";

// A simple express handler that shows the login / registration screen.
// Argument "type" can either be "login" or "registration" and will
// fetch the form data from ORY Kratos's Public API.
export const authHandler = (type: 'login' | 'registration') => {
  const renderWithRequest = (req: Request, res: Response) => (request: AuthConfig) => {
    const {
      methods: {
        password: {
          config: {fields, action, errors},
        },
      },
    } = request

    const formFields = fields.sort(sortFormFields)

    res.render(type, {
      formAction: action,
      formFields,
      errors,
    })
  }

  return withResource({
    url: new URL(`${config.kratos.admin}/self-service/browser/flows/requests/${type}`),
    resourceName: 'request',
    onNoResource: (req: Request, res: Response) => {
      console.log('No request found in URL, initializing auth flow.')
      res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}`)
    },
    redirectToOnNotFound: `${config.kratos.browser}/self-service/browser/flows/${type}`,
    renderWithResource: renderWithRequest
  })
}
