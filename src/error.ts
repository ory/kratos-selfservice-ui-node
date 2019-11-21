import { NextFunction, Request, Response } from 'express'
import config from './config'
import fetch from 'node-fetch'
import { Config, Errors } from 'types'

export default (req: Request, res: Response, next: NextFunction) => {
  const error = req.query.error

  if (!error) {
    // No error was send, redirecting back to home.
    res.redirect(`/`)
    return
  }

  // This is the ORY Kratos URL. If this app and ORY Kratos are running
  // on the same (e.g. Kubernetes) cluster, this should be ORY Kratos's internal hostname.
  const url = new URL(`${config.kratos.public}/errors`)
  url.searchParams.set('error', error)

  fetch(url.toString())
    .then(response => {
      if (response.status == 404) {
        // The error could not be found, redirect back to home.
        res.redirect(`/`)
        return
      }

      return response.json()
    })
    .then((errors: Errors) => {
      res.status(500).render('error', {
        message: JSON.stringify(errors, null, 2),
      })
    })
    .catch(err => next(err))
}
