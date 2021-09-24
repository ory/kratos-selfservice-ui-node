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

// A simple express handler that shows the registration screen.
export const createRegistrationRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    res.locals.projectName = 'Create account'

    const { flow } = req.query
    const helpers = createHelpers(req)
    const { sdk, apiBaseUrl, basePath, getFormActionUrl } = helpers
    const initFlowUrl = getUrlForFlow(apiBaseUrl, 'registration')

    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!isQuerySet(flow)) {
      logger.debug('No flow ID found in URL query initializing login flow', {
        query: req.query
      })
      res.redirect(303, withReturnTo(initFlowUrl, req.query))
      return
    }

    sdk
      .getSelfServiceRegistrationFlow(flow, req.header('Cookie'))
      .then(({ data: flow }) => {
        flow.ui.action = getFormActionUrl(flow.ui.action)

        // Render the data using a view (e.g. Jade Template):
        res.render('registration', { ...flow, baseUrl: basePath })
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerRegistrationRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  basePath = '/'
) => {
  app.get(
    removeTrailingSlash(basePath) + '/registration',
    requireUnauth(createHelpers),
    createRegistrationRoute(createHelpers)
  )
}
