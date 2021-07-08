import { NextFunction, Request, Response } from 'express'
import { Configuration, V0alpha1Api } from '@ory/kratos-client'
import { isString, redirectOnSoftError } from '../helpers/sdk'
import config from '../config'

// Uses the ORY Kratos NodeJS SDK:
const kratos = new V0alpha1Api(
  new Configuration({ basePath: config.kratos.public })
)

// A simple express handler that shows the registration screen.
export default (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow

  // The flow is used to identify the login and registration flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow ID found in URL, initializing registration flow.')
    res.redirect(`${config.kratos.browser}/self-service/registration/browser`)
    return
  }

  kratos
    .getSelfServiceRegistrationFlow(flow, req.header('Cookie'))
    .then(({ status, data: flow }) => {
      if (status !== 200) {
        return Promise.reject(flow)
      }

      flow.ui.nodes

      // Render the data using a view (e.g. Jade Template):
      res.render('registration', flow)
    })
    // Handle errors using ExpressJS' next functionality:
    .catch(redirectOnSoftError(res, next, '/self-service/registration/browser'))
}
