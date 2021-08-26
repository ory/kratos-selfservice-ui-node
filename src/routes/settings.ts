import { NextFunction, Request, Response } from 'express'
import config from '../config'
import { Configuration, V0alpha2Api } from '@ory/kratos-client'
import { isString, redirectOnSoftError } from '../helpers/sdk'

// Uses the ORY Kratos NodeJS SDK:
const kratos = new V0alpha2Api(
  new Configuration({ basePath: config.kratos.public })
)

// A simple express handler that shows the settings screen.
const settingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const flow = req.query.flow
  // The flow ID is used to identify the account settings flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow found in URL, initializing flow.')
    res.redirect(`${config.kratos.browser}/self-service/settings/browser`)
    return
  }

  // Create a logout URL
  const {
    data: { logout_url: logoutUrl },
  } = await kratos.createSelfServiceLogoutFlowUrlForBrowsers(
    req.header('Cookie')
  )

  kratos
    .getSelfServiceSettingsFlow(flow, undefined, req.header('Cookie'))
    .then(({ status, data: flow }) => {
      if (status !== 200) {
        return Promise.reject(flow)
      }

      // Render the data using a view (e.g. Jade Template):
      res.render('settings', { ...flow, logoutUrl })
    })
    .catch(redirectOnSoftError(res, next, '/self-service/settings/browser'))
}

export default settingsHandler
