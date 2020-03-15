import { NextFunction, Request, Response } from 'express'
import config from '../config'
import { CommonApi } from '@oryd/kratos-client'

const commonApi = new CommonApi(config.kratos.admin)

const profileHandler = (req: Request, res: Response, next: NextFunction) => {
  const request = req.query.request

  // The request is used to identify the login and registraion request and
  // return data like the csrf_token and so on.
  if (!request) {
    console.log('No request found in URL, initializing flow.')
    res.redirect(`${config.kratos.browser}/self-service/browser/flows/profile`)
    return
  }

  commonApi
    .getSelfServiceBrowserProfileManagementRequest(request)
    .then(({ body, response }) => {
      if (response.statusCode == 404 || response.statusCode == 410 || response.statusCode == 403) {
        res.redirect(
          `${config.kratos.browser}/self-service/browser/flows/profile`
        )
        return
      } else if (response.statusCode != 200) {
        return Promise.reject(body)
      }

      return Promise.resolve(body)
    })
    .then(request => {
      if (request) {
        res.render('profile', request.form)
        return
      }

      return Promise.reject(
        'Expected self service profile request to be defined.'
      )
    })
    .catch(err => {
      console.error(err)
      next(err)
    })
}

export default profileHandler
