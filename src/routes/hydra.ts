import { Session } from '@ory/kratos-client'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import csrf from 'csurf'
import { Request, Response, NextFunction } from 'express'

import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  requireAuth,
  RouteCreator,
  RouteRegistrator
} from '../pkg'

const csrfProtection = csrf({ cookie: true })

const redirectToLogin = (
  baseUrlWithoutTrailingSlash: string | undefined,
  kratosBrowserUrl: string,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    next(Error('Unable to used express-session'))
    return
  }

  // 3. Initiate login flow with ORY Kratos:
  //
  //   - `prompt=login` forces a new login from kratos regardless of browser sessions.
  //      This is important because we are letting Hydra handle sessions
  //   - `redirect_to` ensures that when we redirect back to this url,
  //      we will have both the initial ORY Hydra Login Challenge and the ORY Kratos Login Request ID in
  //      the URL query parameters.
  console.log(
    'Initiating ORY Kratos Login flow because neither a ORY Kratos Login Request nor a valid ORY Kratos Session was found.'
  )

  const state = crypto.randomBytes(48).toString('hex')
  req.session.hydraLoginState = state
  req.session.save((error) => {
    if (error) {
      next(error)
      return
    }

    console.debug('Return to: ', {
      url: req.url,
      base: baseUrlWithoutTrailingSlash,
      prot: `${req.protocol}://${req.headers.host}`
    })
    const baseUrl =
      baseUrlWithoutTrailingSlash || `${req.protocol}://${req.headers.host}`
    const returnTo = new URL(req.url, baseUrl)
    returnTo.searchParams.set('hydra_login_state', state)
    console.debug(`returnTo: "${returnTo.toString()}"`, returnTo)

    const redirectTo = getUrlForFlow(
      kratosBrowserUrl,
      'login',
      new URLSearchParams({
        refresh: 'true',
        return_to: returnTo.toString()
      })
    )
    console.debug(`redirectTo: "${redirectTo.toString()}"`, redirectTo)
    res.redirect(redirectTo)
  })
}

export const hydraLogin: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    const helpers = createHelpers(req)
    const { sdk, hydraAdmin, apiBaseUrl, baseUrlWithoutTrailingSlash } = helpers

    // The hydraChallenge represents the Hydra login_challenge query parameter.
    const {
      login_challenge: hydraChallenge,
      hydra_login_state: hydraLoginState
    } = req.query
    if (!isQuerySet(hydraChallenge)) {
      const error = new Error(
        'ORY Hydra Login flow could not be completed because no ORY Hydra Login Challenge was found in the HTTP request.'
      )
      next(error)
      return
    }

    // 1. Parse Hydra hydraChallenge from query params
    // The hydraChallenge is used to fetch information about the login kratosRequest from ORY Hydra.
    // Means we have just been redirected from Hydra, and are on the login page
    // We must check the hydra session to see if we can skip login

    // 2. Call Hydra and check the session of this user
    return hydraAdmin
      .getLoginRequest(hydraChallenge)
      .then(({ data: body }) => {
        // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
        // the user.
        if (body.skip) {
          // You can apply logic here, for example update the number of times the user logged in...
          // Now it's time to grant the login kratosRequest. You could also deny the kratosRequest if something went terribly wrong
          // (e.g. your arch-enemy logging in...)
          console.debug(
            `Accepting ORY Hydra Login Request because skip is true (sub: ${body.subject})`
          )
          return hydraAdmin
            .acceptLoginRequest(hydraChallenge, {
              subject: String(body.subject)
            })
            .then(({ data: body }) => {
              // All we need to do now is to redirect the user back to hydra!
              res.redirect(String(body.redirect_to))
            })
        }

        if (!isQuerySet(hydraLoginState)) {
          console.debug(
            'Redirecting to login page because hydra_login_state was not found in the HTTP URL query parameters.'
          )
          redirectToLogin(
            baseUrlWithoutTrailingSlash,
            apiBaseUrl,
            req,
            res,
            next
          )
          return
        }

        const kratosSessionCookie = req.cookies.ory_kratos_session
        if (!kratosSessionCookie) {
          // The state was set but we did not receive a session. Let's retry.
          console.debug(
            'Redirecting to login page because no ORY Kratos session cookie was set.'
          )
          redirectToLogin(
            baseUrlWithoutTrailingSlash,
            apiBaseUrl,
            req,
            res,
            next
          )
          return
        }

        if (hydraLoginState !== req.session?.hydraLoginState) {
          // States mismatch, retry.
          console.debug(
            'Redirecting to login page because login states do not match.'
          )
          redirectToLogin(
            baseUrlWithoutTrailingSlash,
            apiBaseUrl,
            req,
            res,
            next
          )
          return
        }

        // Figuring out the user
        // req.headers['host'] = config.kratos.public.split('/')[2]
        return (
          sdk
            // We need to know who the user is for hydra
            .toSession(undefined, req.header('Cookie'))
            .then(({ data: body }) => {
              // We need to get the email of the user. We don't want to do that via traits as
              // they are dynamic. They would be part of the PublicAPI. That's not true
              // for identity.addresses So let's get it via the AdmninAPI
              const subject = body.identity.id

              // User is authenticated, accept the LoginRequest and tell Hydra
              return hydraAdmin
                .acceptLoginRequest(hydraChallenge, {
                  subject,
                  context: body
                })
                .then(({ data: body }) => {
                  // All we need to do now is to redirect the user back to hydra!
                  res.redirect(String(body.redirect_to))
                })
            })
        )
      })
      .catch(next)
  }

const createHydraSession = (
  requestedScope: string[] = [],
  context: Session
) => {
  const verifiableAddresses = context.identity.verifiable_addresses || []
  if (
    requestedScope.indexOf('email') === -1 ||
    verifiableAddresses.length === 0
  ) {
    return {}
  }

  return {
    // This data will be available when introspecting the token. Try to avoid sensitive information here,
    // unless you limit who can introspect tokens. (Therefore the scope-check above)
    // access_token: { foo: 'bar' },

    // This data will be available in the ID token.
    // Most services need email-addresses, so let's include that.
    id_token: {
      email: verifiableAddresses[0].value as Object // FIXME Small typescript workaround caused by a bug in Go-swagger
    }
  }
}

export const hydraGetConsent: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    const helpers = createHelpers(req)
    const { hydraAdmin } = helpers

    // Parses the URL query
    // The challenge is used to fetch information about the consent request from ORY Hydra.
    const { consent_challenge } = req.query
    if (!isQuerySet(consent_challenge)) {
      next(new Error('Expected consent_challenge to be set.'))
      return
    }

    hydraAdmin
      .getConsentRequest(consent_challenge)
      // This will be called if the HTTP request was successful
      .then(({ data: body }) => {
        // If a user has granted this application the requested scope, hydra will tell us to not show the UI.
        if (body.skip) {
          // You can apply logic here, for example grant another scope, or do whatever...
          // ...

          // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
          return hydraAdmin
            .acceptConsentRequest(consent_challenge, {
              // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
              // are requested accidentally.
              grant_scope: body.requested_scope,

              // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
              grant_access_token_audience: body.requested_access_token_audience,

              // The session allows us to set session data for id and access tokens
              session: createHydraSession(
                body.requested_scope,
                body.context as Session
              )
            })
            .then(({ data: body }) => {
              // All we need to do now is to redirect the user back to hydra!
              res.redirect(String(body.redirect_to))
            })
        }

        // If consent can't be skipped we MUST show the consent UI.
        res.render('consent', {
          csrfToken: req.csrfToken(),
          challenge: consent_challenge,
          // We have a bunch of data available from the response, check out the API docs to find what these values mean
          // and what additional data you have available.
          requested_scope: body.requested_scope,
          user: body.subject,
          client: body.client
        })
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch(next)
  }

export const hydraPostConsent: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    const helpers = createHelpers(req)
    const { hydraAdmin } = helpers

    // The challenge is now a hidden input field, so let's take it from the request body instead
    const challenge = req.body.challenge

    // Let's see if the user decided to accept or reject the consent request..
    if (req.body.submit === 'Deny access') {
      // Looks like the consent request was denied by the user
      return (
        hydraAdmin
          .rejectConsentRequest(challenge, {
            error: 'access_denied',
            error_description: 'The resource owner denied the request'
          })
          .then(({ data: body }) => {
            // All we need to do now is to redirect the browser back to hydra!
            res.redirect(String(body.redirect_to))
          })
          // This will handle any error that happens when making HTTP calls to hydra
          .catch(next)
      )
    }
    // label:consent-deny-end

    let grantScope = req.body.grant_scope
    if (!Array.isArray(grantScope)) {
      grantScope = [grantScope]
    }

    // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
    hydraAdmin
      .getConsentRequest(challenge)
      // This will be called if the HTTP request was successful
      .then(({ data: body }) => {
        return hydraAdmin
          .acceptConsentRequest(challenge, {
            // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
            // are requested accidentally.
            grant_scope: grantScope,

            // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
            // the app is built for the automated OpenID Connect Conformity Test Suite. You
            // can peak inside the code for some ideas, but be aware that all data is fake
            // and this only exists to fake a login system which works in accordance to OpenID Connect.
            //
            // If that variable is not set, the session will be used as-is.
            session: createHydraSession(
              body.requested_scope,
              body.context as Session
            ),

            // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
            grant_access_token_audience: body.requested_access_token_audience,

            // This tells hydra to remember this consent request and allow the same client to request the same
            // scopes from the same user, without showing the UI, in the future.
            remember: Boolean(req.body.remember),

            // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
            remember_for: 3600
          })
          .then(({ data: body }) => {
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(body.redirect_to))
          })
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch(next)
    // label:docs-accept-consent
  }

export const registerHydraRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig
) => {
  app.get('/hydra/login', hydraLogin(createHelpers))
  app.get(
    '/hydra/consent',
    requireAuth(createHelpers),
    csrfProtection,
    hydraGetConsent(createHelpers)
  )
  app.post(
    '/hydra/consent',
    requireAuth(createHelpers),
    bodyParser.urlencoded({ extended: false }),
    csrfProtection,
    hydraPostConsent(createHelpers)
  )
}
