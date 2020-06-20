import {NextFunction, Request, Response} from 'express'
import hydra from './../services/hydra.js';
import config from '../config'
import {sortFormFields} from '../translations'
import {
  AdminApi,
  FormField,
  LoginRequest,
  RegistrationRequest,
} from '@oryd/kratos-client'
import {IncomingMessage} from 'http'
import url from 'url';

// A simple express handler that shows the login / registration screen.
// Argument "type" can either be "login" or "registration" and will
// fetch the form data from ORY Kratos's Public API.
const adminEndpoint = new AdminApi(config.kratos.admin)

export const authHandler = (type: 'login' | 'registration') => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // The request is used to identify the login and registration request in ORY Kratos and return data like the csrf_token and so on.
  const request = req.query.request
  const currentLocation = `${req.protocol}://${req.headers.host}${req.url}`;

  const query = url.parse(req.url, true).query;
  // TODO FIGURE OUT HOW TO DO LOGIN AND REGISTRATION PAGES WITHOUT COOKIE FOR KEEPING THE CHALLENGE
  let challenge = query.login_challenge || req.cookies.login_challenge;
  res.cookie("login_challenge", challenge);

  if (!request) {
    if (!challenge) {
      // 3. Initiate login flow with Kratos
      // prompt=login forces a new login from kratos regardless of browser sessions - this is important because we are letting Hydra handle sessions
      // redirect_to ensures that when we redirect back to this url, we will have both the initial hydra challenge and the kratos request id in query params
      res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}?prompt=login`)
      return
    } else {
      // 1. Parse Hydra challenge from query params
      // The challenge is used to fetch information about the login request from ORY Hydra.
      // Means we have just been redirected from Hydra, and are on the login page
      // We must check the hydra session to see if we can skip login
      console.log("Checking Hydra Sessions");
      // 2. Call Hydra and check the session of this user
      return hydra.getLoginRequest(challenge)
        .then((hydraResponse: any) => {
          // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
          // the user.
          if (hydraResponse.skip) {
            // You can apply logic here, for example update the number of times the user logged in...
            // Now it's time to grant the login request. You could also deny the request if something went terribly wrong
            // (e.g. your arch-enemy logging in...)
            return hydra.acceptLoginRequest(challenge, {
              // All we need to do is to confirm that we indeed want to log in the user.
              subject: hydraResponse.subject
            }).then((hydraResponse: any) => {
              // All we need to do now is to redirect the user back to hydra!
              res.redirect(hydraResponse.redirect_to)
            });
          } else {
            // 3. Initiate login flow with Kratos
            // prompt=login forces a new login from kratos regardless of browser sessions - this is important because we are letting Hydra handle sessions
            // redirect_to ensures that when we redirect back to this url, we will have both the initial hydra challenge and the kratos request id in query params
            res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}?prompt=login&return_to=${currentLocation}`)
          }
        })
        .catch((err:any) => {
          console.error(err)
          next(err)
        });
    }
  }

  const authRequest: Promise<{
    response: IncomingMessage
    body?: LoginRequest | RegistrationRequest
  }> =
    type === 'login'
      ? adminEndpoint.getSelfServiceBrowserLoginRequest(request)
      : adminEndpoint.getSelfServiceBrowserRegistrationRequest(request)

  authRequest
    .then(({body, response}) => {
      if (response.statusCode == 404 || response.statusCode == 410 || response.statusCode == 403) {
        res.redirect(
          `${config.kratos.browser}/self-service/browser/flows/${type}`
        )
        return
      } else if (response.statusCode != 200) {
        return Promise.reject(body)
      }

      return body
    })
    .then((request?: LoginRequest | RegistrationRequest) => {
      if (!request) {
        res.redirect(`${config.kratos.browser}/self-service/browser/flows/${type}`)
        return
      }

      if (request.methods.password.config?.fields) {
        // We want the form fields to be sorted so that the email address is first, the
        // password second, and so on.
        request.methods.password.config.fields = request.methods.password.config.fields.sort(sortFormFields)
      }

      // This helper returns a request method config (e.g. for the password flow).
      // If active is set and not the given request method key, it wil be omitted.
      // This prevents the user from e.g. signing up with email but still seeing
      // other sign up form elements when an input is incorrect.
      const methodConfig = (key: string) => {
        if (request?.active === key || !request?.active) {
          return request?.methods[key]?.config
        }
      }

      console.log(request);
      res.render(type, {
        ...request,
        challenge,
        oidc:methodConfig("oidc"),
        password:methodConfig("password"),
      })
    })
    .catch((err) => {
      console.error(err)
      next(err)
    })
}
