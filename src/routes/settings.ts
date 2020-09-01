import {NextFunction, Request, Response} from 'express'
import config from '../config'
import {CommonApi, PublicApi} from '@oryd/kratos-client'
import {isString} from "../helpers";

const kratos = new CommonApi(config.kratos.admin)

const settingsHandler = (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow
  // The flow ID is used to identify the account settings flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow found in URL, initializing flow.')
    res.redirect(`${config.kratos.browser}/self-service/settings/browser`)
    return
  }

  kratos
    .getSelfServiceSettingsFlow(flow)
    .then(({body, response}) => {
      if (response.statusCode == 404 || response.statusCode == 410 || response.statusCode == 403) {
        res.redirect(
          `${config.kratos.browser}/self-service/settings/browser`
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
