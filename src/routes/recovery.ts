import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  removeTrailingSlash,
  requireUnauth,
  RouteCreator,
  RouteRegistrator,
  withReturnTo
} from '../pkg'

export const createRecoveryRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = 'Recover account'

    const { flow } = req.query
    const helpers = createHelpers(req)
    const { sdk, apiBaseUrl, basePath, getFormActionUrl } = helpers
    const initFlowUrl = getUrlForFlow(apiBaseUrl, 'recovery')

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
      .getSelfServiceRecoveryFlow(flow, req.header('cookie'))
      .then(({ data: flow }) => {
        flow.ui.action = getFormActionUrl(flow.ui.action)

        res.render('recovery', { ...flow, baseUrl: basePath })
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerRecoveryRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  basePath = '/'
) => {
  app.get(
    removeTrailingSlash(basePath) + '/recovery',
    requireUnauth(createHelpers),
    createRecoveryRoute(createHelpers)
  )
}
