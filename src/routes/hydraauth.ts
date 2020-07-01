import {NextFunction, Request, Response} from 'express'
import config from '../config'
import {sortFormFields} from '../translations'
import {
  AdminApi,
  PublicApi,
  FormField,
  LoginRequest,
  RegistrationRequest,
} from '@oryd/kratos-client'
import {AdminApi as HydraAdminApi, AcceptLoginRequest} from '@oryd/hydra-client'
import {IncomingMessage} from 'http'
import url from 'url';
import jd from 'jwt-decode';
import {authInfo} from './home'

const hydraAdminEndpoint = new HydraAdminApi(process.env.HYDRA_ADMIN_URL)
const kratosPublicEndpoint = new PublicApi(config.kratos.public)

type UserRequest = Request & { user: any }

export default (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("    --> hitting (auth/hydra/login ...")
  const ai = authInfo(req as UserRequest)
  console.log("    --> authInfo "+JSON.stringify(ai))
  // The request is used to identify the login and registration request in ORY Kratos and return data like the csrf_token and so on.
  const request = req.query.request
  const currentLocation = `${req.protocol}://${req.headers.host}${req.url}`;

  const query = url.parse(req.url, true).query;
  // TODO FIGURE OUT HOW TO DO LOGIN AND REGISTRATION PAGES WITHOUT COOKIE FOR KEEPING THE CHALLENGE
  let challenge = query.login_challenge || req.cookies.login_challenge;
  if (challenge != null && challenge != "undefined") {
    console.log("    --> Writing the login_challenge cookie from hydra: " + challenge);
    res.cookie("login_challenge", challenge);
  } else {
    console.log("challenge exists: "+challenge)
  } 
  // ToDo Need to check more specific here!
  const kratos_session = req.cookies.ory_kratos_session

  if (!request) {
    if (!kratos_session) {
      // 3. Initiate login flow with Kratos
      // prompt=login forces a new login from kratos regardless of browser sessions - this is important because we are letting Hydra handle sessions
      // redirect_to ensures that when we redirect back to this url, we will have both the initial hydra challenge and the kratos request id in query params
      console.log("    --> no request, not authenticated. Redirecting to kratos");
      let return_to_address = encodeURI(currentLocation);
      res.redirect(`${config.kratos.browser}/self-service/browser/flows/login?prompt=login&return_to=${return_to_address}`);
      return
    }
    if (!challenge) {
      console.log("No request but also no challenge, Invalid request!");
      next()
      return
    } else {
      // 1. Parse Hydra challenge from query params
      // The challenge is used to fetch information about the login request from ORY Hydra.
      // Means we have just been redirected from Hydra, and are on the login page
      // We must check the hydra session to see if we can skip login
      console.log("    --> Checking Hydra Sessions");
      // 2. Call Hydra and check the session of this user

      return hydraAdminEndpoint.getLoginRequest(challenge)
        .then(({ response, body }) => {
          // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
          // the user.
          if (body.skip) {
            // You can apply logic here, for example update the number of times the user logged in...
            // Now it's time to grant the login request. You could also deny the request if something went terribly wrong
            // (e.g. your arch-enemy logging in...)
            let acceptLoginRequest = new AcceptLoginRequest()

            acceptLoginRequest.subject = body.subject
            console.log("    -> acceptLoginRequest: "+acceptLoginRequest)
            return hydraAdminEndpoint.acceptLoginRequest(challenge, acceptLoginRequest
              // All we need to do is to confirm that we indeed want to log in the user.
              
            ).then((hydraResponse: any) => {
              // All we need to do now is to redirect the user back to hydra!
              res.redirect(hydraResponse.redirect_to)
            });
          } else if (kratos_session){
            // Figuring out the user
            kratosPublicEndpoint
              // We need to know who the user is for hydra
              .whoami(req as { headers: { [name: string]: string } })
              .then( ({ body, response }) => {
                // User is authenticated, accept the LoginRequest and tell Hydra
                let acceptLoginRequest = new AcceptLoginRequest()
                acceptLoginRequest.subject = body.identity.id
                return hydraAdminEndpoint.acceptLoginRequest(challenge, {
                  // All we need to do is to confirm that we indeed want to log in the user.
                  subject: body.identity.id
                }).then((hydraResponse: any) => {
                  // All we need to do now is to redirect the user back to hydra!
                  res.redirect(hydraResponse.body.redirectTo)
                })                
                .catch((err:any) => {
                  // Something went wrong with validating the whoami answer
                  console.log(err)
                  next(err)
                });
              })
              .catch((err:any) => {
                // Something went wrong with the whoami call
                console.log(err)
                next(err)
              });
          } else {
            // No request, challenge existing but also not authenticated. Unknown state!
            console.log("No request, challenge existing but also not authenticated. Unknown state!")
            next()
          }
        })
        .catch((err:any) => {
          console.log("    --> Something went wrong with validating hydra's challenge getting the LohginRequest:"+challenge)
          console.log(err)
          res.status(500).send('Something went wrong with your challenge!');
          next()
        });
    }
  }
}