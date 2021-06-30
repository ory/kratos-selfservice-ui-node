import { NextFunction, Request, Response } from 'express'
import config from '../config'
import { Configuration, PublicApi } from '@ory/kratos-client'
import { isString, redirectOnSoftError } from '../helpers/sdk'

const kratos = new PublicApi(
  new Configuration({ basePath: config.kratos.public })
)

export default (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow

  // The flow is used to identify the account verification flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No request found in URL, initializing verification flow.')
    res.redirect(`${config.kratos.browser}/self-service/verification/browser`)
    return
  }

  kratos
    .getSelfServiceVerificationFlow(flow, req.header('Cookie'))
    .then(({ status, data: flow }) => {
      if (status != 200) {
        return Promise.reject(flow)
      }

      // Render the data using a view (e.g. Jade Template):
      res.render('verification', flow)
    })
    .catch(redirectOnSoftError(res, next, '/self-service/verification/browser'))
}
