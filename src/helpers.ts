import { AxiosError } from 'axios'
import config from './config'
import { NextFunction, Response } from 'express'
import {
  FormField,
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
} from '@oryd/kratos-client'
import { getPosition } from './translations'

export const isString = (x: any): x is string => typeof x === 'string'

// Redirects to the specified URL if the error is an AxiosError with a 404, 410,
// or 403 error code.
export const redirectOnSoftError = (
  res: Response,
  next: NextFunction,
  redirectTo: string
) => (err: AxiosError) => {
  if (!err.response) {
    next(err)
    return
  }

  if (
    err.response.status === 404 ||
    err.response.status === 410 ||
    err.response.status === 403
  ) {
    res.redirect(`${config.kratos.browser}${redirectTo}`)
    return
  }

  next(err)
}

// This helper returns a flow method config (e.g. for the password flow).
// If active is set and not the given flow method key, it wil be omitted.
// This prevents the user from e.g. signing up with email but still seeing
// other sign up form elements when an input is incorrect.
//
// It also sorts the form fields so that e.g. the email address is first.
export const methodConfig = (
  flow:
    | LoginFlow
    | RegistrationFlow
    | RecoveryFlow
    | SettingsFlow
    | VerificationFlow,
  key: string
) => {
  if (flow.active && flow.active !== key) {
    // The flow has an active method but it is not the one we're looking at -> return empty
    return
  }

  if (!flow.methods[key]) {
    // The flow method is apparently not configured -> return empty
    return
  }

  const config = flow.methods[key].config

  // We want the form fields to be sorted so that the email address is first, the
  // password second, and so on.
  config?.fields.sort(
    (first: FormField, second: FormField) =>
      getPosition(first) - getPosition(second)
  )

  return config
}

export const jsonPretty = (context: any) => JSON.stringify(context, null, 2)
