import { NextFunction, Request, Response } from 'express'
import { Configuration, PublicApi } from '@ory/kratos-client'

import config from '../config'
import { isString, redirectOnSoftError } from '../helpers/sdk'

// Variable config has keys:
// kratos: {
//
//   // The browser config key is used to redirect the user. It reflects where ORY Kratos' Public API
//   // is accessible from. Here, we're assuming traffic going to `http://example.org/.ory/kratos/public/`
//   // will be forwarded to ORY Kratos' Public API.
//   browser: 'https://kratos.example.org',
//
//   // The location of the ORY Kratos Admin API
//   admin: 'https://ory-kratos-admin.example-org.vpc',
//
//   // The location of the ORY Kratos Public API within the cluster
//   public: 'https://ory-kratos-public.example-org.vpc',
// },

// Uses the ORY Kratos NodeJS SDK - for more SDKs check:
//
//  https://www.ory.sh/kratos/docs/sdk/index
const kratos = new PublicApi(
  new Configuration({ basePath: config.kratos.public })
)

// A simple express handler that shows the login / registration screen.
// Argument "type" can either be "login" or "registration" and will
// fetch the form data from ORY Kratos's Public API.
export default (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow

  // The flow is used to identify the login and registration flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow ID found in URL, initializing login flow.')
    res.redirect(`${config.kratos.browser}/self-service/login/browser`)
    return
  }

  return (
    kratos
      .getSelfServiceLoginFlow(flow, req.header('cookie'))
      .then(({ status, data: flow, ...response }) => {
        if (status !== 200) {
          return Promise.reject(flow)
        }

        // Render the data using a view (e.g. Jade Template):
        res.render('login', flow)
      })
      // Handle errors using ExpressJS' next functionality:
      .catch(redirectOnSoftError(res, next, '/self-service/login/browser'))
  )
}
