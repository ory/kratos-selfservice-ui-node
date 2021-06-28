import { AxiosError } from 'axios';
import config from '../config';
import { NextFunction, Response } from 'express';

export const isString = (x: any): x is string => typeof x === 'string';

// Redirects to the specified URL if the error is an AxiosError with a 404, 410,
// or 403 error code.
export const redirectOnSoftError = (
  res: Response,
  next: NextFunction,
  redirectTo: string
) => (err: AxiosError) => {
  if (!err.response) {
    next(err);
    return;
  }

  if (
    err.response.status === 404 ||
    err.response.status === 410 ||
    err.response.status === 403
  ) {
    res.redirect(`${config.kratos.browser}${redirectTo}`);
    return;
  }

  next(err);
};
