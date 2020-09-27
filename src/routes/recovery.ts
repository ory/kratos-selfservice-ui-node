import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { Configuration, PublicApi } from '@oryd/kratos-client';
import { isString, redirectOnSoftError } from '../helpers';

const kratos = new PublicApi(new Configuration({ basePath: config.kratos.public }));

export default (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow;

  // The flow is used to identify the account recovery flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No request found in URL, initializing recovery flow.');
    res.redirect(`${config.kratos.browser}/self-service/recovery/browser`);
    return;
  }

  kratos
    .getSelfServiceRecoveryFlow(flow)
    .then(({ status, data: body }) => {
      if (status != 200) {
        return Promise.reject(body);
      }

      // This helper returns a request method config (e.g. for the email flow).
      // If active is set and not the given request method key, it wil be omitted.
      // This prevents the user from e.g. signing up with email but still seeing
      // other sign up form elements when an input is incorrect.
      const methodConfig = (key: string) => {
        if (body?.active === key || !body?.active) {
          return body?.methods[key]?.config;
        }
      };

      res.render('recovery', {
        ...body,
        link: methodConfig('link'),
      });
    })
    .catch(redirectOnSoftError(res, next, '/self-service/recovery/browser'));
}
