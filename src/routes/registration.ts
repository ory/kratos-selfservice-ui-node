import {NextFunction, Request, Response} from 'express'
import {AdminApi, LoginFlow, RegistrationFlow} from '@oryd/kratos-client'
import {IncomingMessage} from 'http'

import config from '../config'
import {sortFormFields} from '../translations'
import {isString} from "../helpers";

// Variable config has keys:
// kratos: {
//
//   // The browser config key is used to redirect the user. It reflects where ORY Kratos' Public API
//   // is accessible from. Here, we're assuming traffic going to `http://example.org/.ory/kratos/public/`
//   // will be forwarded to ORY Kratos' Public API.
//   browser: 'https://kratos.example.org',
//
//   // The locatoin of the ORY Kratos Admin API
//   admin: 'https://ory-kratos-admin.example-org.vpc',
// },

// Uses the ORY Kratos NodeJS SDK - for more SDKs check:
//
//  https://www.ory.sh/kratos/docs/sdk/index
const kratos = new AdminApi(config.kratos.admin)

// A simple express handler that shows the login / registration screen.
// Argument "type" can either be "login" or "registration" and will
// fetch the form data from ORY Kratos's Public API.
export default (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const flow = req.query.flow

  // The flow is used to identify the login and registration flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow ID found in URL, initializing registration flow.')
    res.redirect(
      `${config.kratos.browser}/self-service/registration/browser`
    )
    return
  }

  kratos.getSelfServiceRegistrationFlow(flow)
    .then(({body: flow, response}) => {
      if (response.statusCode == 404 || response.statusCode == 410 || response.statusCode == 403 || !flow) {
        res.redirect(`${config.kratos.browser}/self-service/registration/browser`)
        return
      } else if (response.statusCode != 200) {
        return Promise.reject(flow)
      }

      if (flow.methods.password.config?.fields) {
        // We want the form fields to be sorted so that the email address is first, the
        // password second, and so on.
        flow.methods.password.config.fields = flow.methods.password.config.fields.sort(sortFormFields)
      }

      // This helper returns a flow method config (e.g. for the password flow).
      // If active is set and not the given flow method key, it wil be omitted.
      // This prevents the user from e.g. signing up with email but still seeing
      // other sign up form elements when an input is incorrect.
      const methodConfig = (key: string) => {
        if (flow?.active === key || !flow?.active) {
          return flow?.methods[key]?.config
        }
      }

      // Render the data using a view (e.g. Jade Template):
      res.render('registration', {
        ...flow,
        oidc: methodConfig("oidc"),
        password: methodConfig("password"),
      })
    })
    // Handle errors using ExpressJS' next functionality:
    .catch(next)
}
