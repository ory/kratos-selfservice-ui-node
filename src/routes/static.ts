import { expressHandler } from '@ory/themes/css/express'
import express from 'express'

import { RouteRegistrator } from '../pkg'

export const registerStaticRoutes: RouteRegistrator = (app) => {
  app.get(
    '/theme.css',
    expressHandler({
      grey0: '#F9F9FA',
      grey5: '#F0F0F1',
      grey10: '#E1E1E3',
      grey30: '#B4B4BB',
      grey60: '#5A5B6A',
      grey70: '#4A4B57',
      grey100: '#19191D',

      blue30: '#9DC2FF',
      blue60: '#2979FF',
      blue70: '#2264D1',

      green30: '#A9D3AB',
      green60: '#43A047',
      green70: '#37833B',

      red30: '#FAA9A3',
      red60: '#F44336',
      red70: '#C8372D',

      blueGrey30: '#B4BBE2',
      blueGrey60: '#97A0D6',

      primaryAccent: '#FF80FF',

      primary30: '#af3a03',
      primary60: '#d65d0e',
      primary70: '#9d0006',

      borderRadius: '4px',

      regularFont300: "'Rubik', sans-serif",
      regularFont400: "'Rubik', sans-serif",
      regularFont500: "'Rubik', sans-serif",
      codeFont400: "'Roboto Mono', sans-serif"
    })
  )
  app.use('/', express.static('public'))
  app.use('/', express.static('node_modules/normalize.css'))
}
