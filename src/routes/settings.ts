import {NextFunction, Request, Response} from 'express'
import config from '../config'
import {CommonApi} from '@oryd/kratos-client'
import {isString} from "../helpers";

const kratos = new CommonApi(config.kratos.admin)

const settingsHandler = (req: Request, res: Response, next: NextFunction) => {
  const request = req.query.request
  // The request is used to identify the account settings request and
  // return data like the csrf_token and so on.
  if (!request || !isString(request)) {
    console.log('No request found in URL, initializing flow.')
    res.redirect(`${config.kratos.browser}/self-service/browser/flows/settings`)
    return
  }

  kratos
    .getSelfServiceBrowserSettingsRequest(request)
    .then(({body, response}) => {
      if (response.statusCode == 404 || response.statusCode == 410 || response.statusCode == 403) {
        res.redirect(
          `${config.kratos.browser}/self-service/browser/flows/settings`
        )
        return
      } else if (response.statusCode != 200) {
        return Promise.reject(body)
      }

      const methodConfig = (key: string) => body?.methods[key]?.config

      res.render('settings', {
        ...body,
        password: methodConfig("password"),
        profile: methodConfig("profile"),
        oidc: methodConfig("oidc"),
      })
    })
    .catch(next)
}

export default settingsHandler
