import { NextFunction, Request, Response } from 'express'
import config from '../config'
import { Configuration, PublicApi } from '@ory/kratos-client'
import { isString } from '../helpers/sdk'
import { AxiosError } from 'axios'

const kratos = new PublicApi(
  new Configuration({ basePath: config.kratos.public })
)

export default (req: Request, res: Response, next: NextFunction) => {
  const error = req.query.error

  if (!error || !isString(error)) {
    // No error was send, redirecting back to home.
    res.redirect(config.baseUrl)
    return
  }

  kratos
    .getSelfServiceError(error)
    .then(({ status, data: body }) => {
      if ('errors' in body) {
        res.status(500).render('error', {
          message: JSON.stringify(body.errors, null, 2),
        })
        return Promise.resolve()
      }

      return Promise.reject(
        `expected errorContainer to contain "errors" but got ${JSON.stringify(
          body
        )}`
      )
    })
    .catch((err: AxiosError) => {
      if (!err.response) {
        next(err)
        return
      }

      if (err.response.status === 404) {
        // The error could not be found, redirect back to home.
        res.redirect(config.baseUrl)
        return
      }

      next(err)
    })
}
