import { AxiosError } from 'axios' import { NextFunction, Response } from
'express' import qs from 'querystring' import { RouteOptionsCreator } from
'./route' import sdk, { apiBaseUrl } from './sdk' export * from './middleware'
export * from './route' export * from './url' export * from './logger' export
const removeTrailingSlash = (s: string) => s.replace(/\\\/$/, '') export const
getUrlForFlow = ( base: string, flow: string, query?: { [key: string]: any } )
=> `${removeTrailingSlash(base)}/self-service/${flow}/browser${ query ?
`?${qs.encode(query)}` : '' }` export const defaultConfig: RouteOptionsCreator =
() => { return { apiBaseUrl: apiBaseUrl, basePath: '', kratosBrowserUrl:
apiBaseUrl, sdk, getFormActionUrl: (s) => s } } export const isQuerySet = (x:
any): x is string => typeof x === 'string' && x.length > 0 // Redirects to the
specified URL if the error is an AxiosError with a 404, 410, // or 403 error
code. export const redirectOnSoftError = (res: Response, next: NextFunction,
redirectTo: string) => (err: AxiosError) => { if (!err.response) { next(err)
return } if ( err.response.status === 404 || err.response.status === 410 ||
err.response.status === 403 ) { res.redirect(`${redirectTo}`) return } next(err)
}