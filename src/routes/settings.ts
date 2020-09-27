import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { AdminApi, Configuration } from '@oryd/kratos-client';
import { isString, redirectOnSoftError } from '../helpers';

const kratos = new AdminApi(new Configuration({ basePath: config.kratos.admin }));

const settingsHandler = (req: Request, res: Response, next: NextFunction) => {
  const flow = req.query.flow;
  // The flow ID is used to identify the account settings flow and
  // return data like the csrf_token and so on.
  if (!flow || !isString(flow)) {
    console.log('No flow found in URL, initializing flow.');
    res.redirect(`${config.kratos.browser}/self-service/settings/browser`);
    return;
  }

  kratos
    .getSelfServiceSettingsFlow(flow)
    .then(({ status, data: flow }) => {
      if (status !== 200) {
        return Promise.reject(flow);
      }

      const methodConfig = (key: string) => flow?.methods[key]?.config;

      res.render('settings', {
        ...flow,
        password: methodConfig('password'),
        profile: methodConfig('profile'),
        oidc: methodConfig('oidc'),
      });
    })
    .catch(redirectOnSoftError(res, next, '/self-service/settings/browser'));
};

export default settingsHandler;
