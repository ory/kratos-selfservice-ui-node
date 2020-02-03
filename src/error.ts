import {Request, Response} from 'express'
import config from './config'
import {Errors} from 'types'
import {withResource} from "./helpers";

const renderWithError = (req: Request, res: Response) => (errors: Errors) => {
  console.log('got errors from remote:', errors)
  res.status(500).render('error', {
    message: JSON.stringify(errors, null, 2),
  })
}

export default withResource({
  url: new URL(`${config.kratos.admin}/self-service/errors`),
  resourceName: 'error',
  redirectToOnNotFound: '/',
  onNoResource: (req, res) => res.redirect('/'),
  renderWithResource: renderWithError
})
