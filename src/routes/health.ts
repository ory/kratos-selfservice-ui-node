import { Request, Response } from 'express' import { defaultConfig,
removeTrailingSlash, RouteRegistrator } from '../pkg' export const
registerHealthRoute: RouteRegistrator = ( app, createHelpers = defaultConfig,
basePath = '/' ) => { app.get( removeTrailingSlash(basePath) + '/health/alive',
(_: Request, res: Response) => res.send('ok') ) app.get(
removeTrailingSlash(basePath) + '/health/ready', (_: Request, res: Response) =>
res.send('ok') ) }