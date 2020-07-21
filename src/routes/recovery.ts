import {NextFunction, Request, Response} from 'express'
import config from '../config'
import {CommonApi} from '@oryd/kratos-client'
import {IncomingMessage} from 'http'
import {isString} from "../helpers";

const kratos = new CommonApi(config.kratos.admin)

export default (req: Request, res: Response, next: NextFunction) => {
  const request = req.query.request

  // The request is used to identify the account recovery request and
  // return data like the csrf_token and so on.
  if (!request || !isString(request)) {
    console.log('No request found in URL, initializing recovery flow.')
    res.redirect(`${config.kratos.browser}/self-service/browser/flows/recovery`)
    return
  }

  kratos
    .getSelfServiceBrowserRecoveryRequest(request)
    .then(({body, response}: { response: IncomingMessage, body?: any }) => {
      if (response.statusCode == 404) {
        res.redirect(
          `${config.kratos.browser}/self-service/browser/flows/recovery`
        )
        return
      } else if (response.statusCode != 200) {
        return Promise.reject(body)
      }

      // This helper returns a request method config (e.g. for the password flow).
      // If active is set and not the given request method key, it wil be omitted.
      // This prevents the user from e.g. signing up with email but still seeing
      // other sign up form elements when an input is incorrect.
      const methodConfig = (key: string) => {
        if (body?.active === key || !body?.active) {
          return body?.methods[key]?.config
        }
      }

      res.render('recovery', {
        ...body,
        token: methodConfig('link')
      })
    })
    .catch(next)
}
