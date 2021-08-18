import { NextFunction, Request, Response } from 'express';
import { Configuration, V0alpha1Api } from '@ory/kratos-client';
import { isString, redirectOnSoftError } from '../helpers/sdk';
import config from '../config';

// Uses the ORY Kratos NodeJS SDK:
const kratos = new V0alpha1Api(
  new Configuration({ basePath: config.kratos.public }),
);

// A simple express handler that shows the login screen.
export default (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow;

  // The flow is used to identify the login and registration flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow ID found in URL, initializing login flow.');
    const redirectTo = new URL(`${config.kratos.browser}/self-service/login/browser`)

    // If AAL (e.g. 2FA) is requested, forward that to Ory Kratos
    if (req.query.aal) {
      redirectTo.searchParams.set("aal",req.query.aal.toString())
    }

    // If refresh is requested, forward that to Ory Kratos
    if (req.query.refresh) {
      redirectTo.searchParams.set("refresh","true")
    }

    res.redirect(redirectTo.toString());
    return;
  }

  return (
    kratos
      .getSelfServiceLoginFlow(flow, req.header('cookie'))
      .then(({ status, data: flow, ...response }) => {
        if (status !== 200) {
          return Promise.reject(flow);
        }

        // Render the data using a view (e.g. Jade Template):
        res.render('login', flow);
      })
      // Handle errors using ExpressJS' next functionality:
      .catch(redirectOnSoftError(res, next, '/self-service/login/browser'))
  );
}
