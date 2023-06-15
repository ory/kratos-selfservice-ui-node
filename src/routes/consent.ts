// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  AcceptOAuth2ConsentRequestSession,
  IdentityApi,
  OAuth2ConsentRequest,
} from "@ory/client"
import { UserConsentCard } from "@ory/elements-markup"
import bodyParser from "body-parser"
import csrf from "csurf"
import { defaultConfig, RouteCreator, RouteRegistrator } from "../pkg"
import { register404Route } from "./404"
import { oidcConformityMaybeFakeSession } from "./stub/oidc-cert"

async function createOAuth2ConsentRequestSession(
  grantScopes: string[],
  consentRequest: OAuth2ConsentRequest,
  identityApi: IdentityApi,
): Promise<AcceptOAuth2ConsentRequestSession> {
  // The session allows us to set session data for id and access tokens

  const id_token: { [key: string]: any } = {}

  if (consentRequest.subject && grantScopes.length > 0) {
    const identity = (
      await identityApi.getIdentity({ id: consentRequest.subject })
    ).data

    if (grantScopes.indexOf("email") > -1) {
      // Client may check email of user
      id_token.email = identity.traits["email"] || ""
    }
    if (grantScopes.indexOf("phone") > -1) {
      // Client may check phone number of user
      id_token.phone = identity.traits["phone"] || ""
    }
  }

  return {
    // This data will be available when introspecting the token. Try to avoid sensitive information here,
    // unless you limit who can introspect tokens.
    access_token: {
      // foo: 'bar'
    },

    // This data will be available in the ID token.
    id_token,
  }
}

// A simple express handler that shows the Hydra consent screen.
export const createConsentRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    console.log("createConsentRoute")
    res.locals.projectName = "An application requests access to your data!"

    const { oauth2, identity } = createHelpers(req, res)
    const { consent_challenge } = req.query

    // The challenge is used to fetch information about the consent request from ORY hydraAdmin.
    const challenge = String(consent_challenge)
    if (!challenge) {
      next(
        new Error("Expected a consent challenge to be set but received none."),
      )
      return
    }

    let trustedClients: string[] = []
    if (process.env.TRUSTED_CLIENT_IDS) {
      trustedClients = String(process.env.TRUSTED_CLIENT_IDS).split(",")
    }

    console.log("getOAuth2ConsentRequest", challenge)
    // This section processes consent requests and either shows the consent UI or
    // accepts the consent request right away if the user has given consent to this
    // app before
    oauth2
      .getOAuth2ConsentRequest({ consentChallenge: challenge })
      // This will be called if the HTTP request was successful
      .then(async ({ data: body }) => {
        // If a user has granted this application the requested scope, hydra will tell us to not show the UI.
        if (
          body.skip ||
          body.client?.skip_consent ||
          (body.client?.client_id &&
            trustedClients.indexOf(body.client?.client_id) > -1)
        ) {
          // You can apply logic here, for example grant another scope, or do whatever...
          // ...

          let grantScope: string[] = body.requested_scope || []
          if (!Array.isArray(grantScope)) {
            grantScope = [grantScope]
          }
          const session = await createOAuth2ConsentRequestSession(
            grantScope,
            body,
            identity,
          )

          // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
          return oauth2
            .acceptOAuth2ConsentRequest({
              consentChallenge: challenge,
              acceptOAuth2ConsentRequest: {
                // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
                // are requested accidentally.
                grant_scope: grantScope,

                // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
                grant_access_token_audience:
                  body.requested_access_token_audience,

                // The session allows us to set session data for id and access tokens
                session,
              },
            })
            .then(({ data: body }) => {
              // All we need to do now is to redirect the user back to hydra!
              res.redirect(String(body.redirect_to))
            })
        }

        // If consent can't be skipped we MUST show the consent UI.
        res.render("consent", {
          card: UserConsentCard({
            consent: body,
            csrfToken: req.csrfToken(),
            cardImage: body.client?.logo_uri || "/ory-logo.svg",
            client_name: body.client?.client_name || "unknown client",
            requested_scope: body.requested_scope,
            client: body.client,
            action: (process.env.BASE_URL || "") + "/consent",
          }),
        })
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch(next)
    // The consent request has now either been accepted automatically or rendered.
  }

export const createConsentPostRoute: RouteCreator =
  (createHelpers) => (req, res, next) => {
    // The challenge is a hidden input field, so we have to retrieve it from the request body
    const challenge = req.body.consent_challenge
    const { oauth2, identity } = createHelpers(req, res)

    // Let's see if the user decided to accept or reject the consent request..
    if (req.body.submit === "Deny access") {
      // Looks like the consent request was denied by the user
      return (
        oauth2
          .rejectOAuth2ConsentRequest({
            consentChallenge: challenge,
            rejectOAuth2Request: {
              error: "access_denied",
              error_description: "The resource owner denied the request",
            },
          })
          .then(({ data: body }) => {
            // All we need to do now is to redirect the browser back to hydra!
            res.redirect(String(body.redirect_to))
          })
          // This will handle any error that happens when making HTTP calls to hydra
          .catch(next)
      )
    }

    let grantScope = req.body.grant_scope
    if (!Array.isArray(grantScope)) {
      grantScope = [grantScope]
    }

    // Here is also the place to add data to the ID or access token. For example,
    // if the scope 'profile' is added, add the family and given name to the ID Token claims:
    // if (grantScope.indexOf('profile')) {
    //   session.id_token.family_name = 'Doe'
    //   session.id_token.given_name = 'John'
    // }

    // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
    oauth2
      .getOAuth2ConsentRequest({ consentChallenge: challenge })
      // This will be called if the HTTP request was successful
      .then(async ({ data: body }) => {
        const session = await createOAuth2ConsentRequestSession(
          grantScope,
          body,
          identity,
        )
        return oauth2
          .acceptOAuth2ConsentRequest({
            consentChallenge: challenge,
            acceptOAuth2ConsentRequest: {
              // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
              // are requested accidentally.
              grant_scope: grantScope,

              // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
              // the app is built for the automated OpenID Connect Conformity Test Suite. You
              // can peak inside the code for some ideas, but be aware that all data is fake
              // and this only exists to fake a login system which works in accordance to OpenID Connect.
              //
              // If that variable is not set, the session will be used as-is.
              session: oidcConformityMaybeFakeSession(
                grantScope,
                body,
                session,
              ),

              // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
              grant_access_token_audience: body.requested_access_token_audience,

              // This tells hydra to remember this consent request and allow the same client to request the same
              // scopes from the same user, without showing the UI, in the future.
              remember: Boolean(req.body.remember),

              // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
              remember_for: process.env.REMEMBER_CONSENT_FOR_SECONDS
                ? Number(process.env.REMEMBER_CONSENT_SESSION_FOR_SECONDS)
                : 3600,
            },
          })
          .then(({ data: body }) => {
            // All we need to do now is to redirect the user back!
            res.redirect(String(body.redirect_to))
          })
      })
      .catch(next)
  }

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
})

var parseForm = bodyParser.urlencoded({ extended: false })

export const registerConsentRoute: RouteRegistrator = function (
  app,
  createHelpers = defaultConfig,
) {
  if (process.env.HYDRA_ADMIN_URL) {
    console.log("found HYDRA_ADMIN_URL")
    return app.get(
      "/consent",
      csrfProtection,
      createConsentRoute(createHelpers),
    )
  } else {
    return register404Route
  }
}

export const registerConsentPostRoute: RouteRegistrator = function (
  app,
  createHelpers = defaultConfig,
) {
  if (process.env.HYDRA_ADMIN_URL) {
    return app.post(
      "/consent",
      parseForm,
      csrfProtection,
      createConsentPostRoute(createHelpers),
    )
  } else {
    return register404Route
  }
}
