import { expressHandler } from '@ory/themes/css/express'
import express, { NextFunction, Request, Response } from 'express'

import { defaultConfig, removeTrailingSlash } from '../pkg'
import { RouteRegistrator } from '../pkg'

export const registerStaticRoutes: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  basePath = '/'
) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const { basePath } = defaultConfig(req)
    res.locals.baseUrl = removeTrailingSlash(basePath) + '/'
    next()
  })
  app.get(removeTrailingSlash(basePath) + '/theme.css', expressHandler())
  app.use(removeTrailingSlash(basePath) + '/', express.static('public'))
  app.use(
    removeTrailingSlash(basePath) + '/',
    express.static('node_modules/normalize.css')
  )
}
