import { NextFunction, Request, Response } from 'express'
import config from '../config'
import { Configuration, V0alpha2Api } from '@ory/kratos-client'
import { isString, redirectOnSoftError } from '../helpers/sdk'

// Uses the ORY Kratos NodeJS SDK:
const kratos = new V0alpha2Api(
  new Configuration({ basePath: config.kratos.public })
)

// A simple express handler that shows the recovery screen.
export default (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow

  // The flow is used to identify the account recovery flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No request found in URL, initializing recovery flow.')
    res.redirect(`${config.kratos.browser}/self-service/recovery/browser`)
    return
  }

  kratos
    .getSelfServiceRecoveryFlow(flow, req.header('Cookie'))
    .then(({ status, data: flow }) => {
      if (status !== 200) {
        return Promise.reject(flow)
      }

      // Render the data using a view (e.g. Jade Template):
      res.render('recovery', flow)
    })
    .catch(redirectOnSoftError(res, next, '/self-service/recovery/browser'))
}
