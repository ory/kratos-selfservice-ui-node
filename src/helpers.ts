import {NextFunction, Request, Response} from "express";
import fetch from "node-fetch";

class ErrorWithRedirect extends Error {
  redirectTo: string

  constructor(redirectTo: string) {
    super(`There was an error that is solvable by redirecting to ${redirectTo}.`);
    this.redirectTo = redirectTo
  }
}

export const withResource = ({
                               url,
                               resourceName,
                               renderWithResource,
                               redirectToOnNotFound,
                               onNoResource
                             }: {
  url: URL,
  resourceName: string,
  onNoResource: (req: Request, res: Response) => void,
  redirectToOnNotFound?: string,
  renderWithResource: (req: Request, res: Response) => (resource: any) => void
}) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resource = req.query[resourceName]

  if (!resource) {
    onNoResource(req, res)
    return
  }

  url.searchParams.set(resourceName, resource)

  fetch(url.toString())
    .then(response => {
      console.log(response.url, response.status)
      if (response.status === 404) {
        return Promise.reject(redirectToOnNotFound ? new ErrorWithRedirect(redirectToOnNotFound) : new Error(`${resourceName} ${resource} could not be found.`))
      } else if (response.status !== 200) {
        return response.json().then(body => Promise.reject(body))
      }

      return response.json()
    })
    .then(renderWithResource(req, res))
    .catch(err => {
      if ('redirectTo' in err) {
        console.log(err.message)
        res.redirect(err.redirectTo)
        return
      }

      console.error(err)
      next(err)
    })
}
