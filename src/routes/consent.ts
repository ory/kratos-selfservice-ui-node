import { NextFunction, Request, Response } from 'express'
import {AdminApi as HydraAdminApi, AcceptConsentRequest, RejectRequest} from '@oryd/hydra-client'
import url from 'url';

const hydraAdminEndpoint = new HydraAdminApi(process.env.HYDRA_ADMIN_URL)

export const getConsent = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
  // Parses the URL query
  var query = url.parse(req.url, true).query;
  // The challenge is used to fetch information about the consent request from ORY Hydra.
  var challenge = query.consent_challenge;

  hydraAdminEndpoint.getConsentRequest(String(challenge))
    // This will be called if the HTTP request was successful
    .then(function (response:any) {
      // If a user has granted this application the requested scope, hydra will tell us to not show the UI.
      if (response.skip) {
        // You can apply logic here, for example grant another scope, or do whatever...

        // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
        const acceptConsentRequest = new AcceptConsentRequest()
        // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
          // are requested accidentally.
        acceptConsentRequest.grantScope = response.requested_scope
        // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
        acceptConsentRequest.grantAccessTokenAudience = response.requested_access_token_audience
        // The session allows us to set session data for id and access tokens
        // acceptConsentRequest.session = {
          // This data will be available when introspectin+ the token. Try to avoid sensitive information here,
          // unless you limit who can introspect tokens.
          // access_token: { foo: 'bar' },

          // This data will be available in the ID token.
          // id_token: { baz: 'bar' },
        //}
        return hydraAdminEndpoint.acceptConsentRequest(String(challenge), acceptConsentRequest).then(function (response:any) {
          // All we need to do now is to redirect the user back to hydra!
          res.redirect(response.body.redirectTo);
        });
      }

      // If consent can't be skipped we MUST show the consent UI.
      res.render('consent', {
        // csrfToken: req.csrfToken() ? req.csrfToken() : 'none',
        // csrfToken: TODO CSRF? 'no CSRF!',
        challenge: challenge,
        // We have a bunch of data available from the response, check out the API docs to find what these values mean
        // and what additional data you have available.
        requested_scope: response.requested_scope,
        user: response.subject,
        client: response.client,
      });
    })
    // This will handle any error that happens when making HTTP calls to hydra
    .catch(function (error:any) {
      next(error);
    });
};

export const postConsent = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
  // The challenge is now a hidden input field, so let's take it from the request body instead
  var challenge = req.body.challenge;
  // Let's see if the user decided to accept or reject the consent request..
  if (req.body.submit != 'Allow access') {
    // Looks like the consent request was denied by the user
    const rejectConsentRequest = new RejectRequest()
    rejectConsentRequest.error = 'access_denied'
    rejectConsentRequest.errorDescription = 'The resource owner denied the request'
    
    return hydraAdminEndpoint.rejectConsentRequest( challenge, rejectConsentRequest)
      .then(function (response:any) {
        // All we need to do now is to redirect the browser back to hydra!
        res.redirect(response.body.redirectTo);
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch(function (error:any) {
        next(error);
      });
  }

  var grant_scope = req.body.grant_scope
  if (!Array.isArray(grant_scope)) {
    grant_scope = [grant_scope]
  }

  // Seems like the user authenticated! Let's tell hydra...
  hydraAdminEndpoint.getConsentRequest(challenge)
  // This will be called if the HTTP request was successful
    .then(function (response:any) {
      const acceptConsentRequest = new AcceptConsentRequest()
      // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
      // are requested accidentally.
      acceptConsentRequest.grantScope = grant_scope
      // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
      acceptConsentRequest.grantAccessTokenAudience = response.requested_access_token_audience
      // This tells hydra to remember this consent request and allow the same client to request the same
      // scopes from the same user, without showing the UI, in the future.
      acceptConsentRequest.remember = Boolean(req.body.remember),
      // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
      acceptConsentRequest.rememberFor = 3600
      // The session allows us to set session data for id and access tokens
      // acceptConsentRequest.session = {
        // This data will be available when introspecting the token. Try to avoid sensitive information here,
        // unless you limit who can introspect tokens.
        // access_token: { foo: 'bar' },

        // This data will be available in the ID token.
        // id_token: { baz: 'bar' },
      //}

      return hydraAdminEndpoint.acceptConsentRequest(challenge, acceptConsentRequest)
        .then(function (response:any) {
          // All we need to do now is to redirect the user back to hydra!
          res.redirect(response.body.redirectTo);
        })
    })
    // This will handle any error that happens when making HTTP calls to hydra
    .catch(function (error:any) {
      next(error);
    });
};