import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  removeTrailingSlash,
  requireAuth,
  RouteCreator,
  RouteRegistrator,
  withReturnTo
} from '../pkg'

export const createSettingsRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = 'Account settings'

    const { flow } = req.query
    const helpers = createHelpers(req)
    const { sdk, apiBaseUrl } = helpers
    const initFlowUrl = getUrlForFlow(apiBaseUrl, 'settings')

    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!isQuerySet(flow)) {
      logger.debug('No flow ID found in URL query initializing login flow', {
        query: req.query
      })
      res.redirect(303, withReturnTo(initFlowUrl, req.query))
      return
    }

    return sdk
      .getSelfServiceSettingsFlow(flow, undefined, req.header('cookie'))
      .then(({ data: flow }) => {
        // Render the data using a view (e.g. Jade Template):
        res.render('settings', flow)
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerSettingsRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig
) => {
  app.get(
    '/settings',
    requireAuth(createHelpers),
    createSettingsRoute(createHelpers)
  )
}
