import { expressHandler } from '@ory/themes/css/express'
import express from 'express'

import { RouteRegistrator } from '../pkg'

export const registerStaticRoutes: RouteRegistrator = (app) => {
  app.get('/theme.css', expressHandler())
  app.use('/', express.static('public'))
  app.use('/', express.static('node_modules/normalize.css'))
}
