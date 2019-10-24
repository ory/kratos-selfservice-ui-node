import { Request, Response } from 'express'
import config from './config'

export default (req: Request, res: Response) => {
  res.render('dashboard', {
    identity: {},
    logoutUrl: `${config.hive.public}/auth/browser/logout`,
  })
}
