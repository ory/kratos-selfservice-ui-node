import {Request, Response} from "express";
import config from "./config";
import {ProfileConfig} from "types";
import {withResource} from "./helpers";

const renderWithRequest = (req: Request, res: Response) => (request: ProfileConfig) => {
  const {form} = request

  console.log(JSON.stringify(request))
  res.render('profile', form)
}

export default withResource({
  url: new URL(`${config.kratos.admin}/self-service/browser/flows/requests/profile`),
  resourceName: 'request',
  redirectToOnNotFound: `${config.kratos.browser}/self-service/browser/flows/profile`,
  onNoResource: ((req, res) => {
    console.log('No request found in URL, initializing profile update flow.')
    res.redirect(`${config.kratos.browser}/self-service/browser/flows/profile`)
  }),
  renderWithResource: renderWithRequest
})
