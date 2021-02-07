import { Request, Response } from 'express'
import { authInfo } from '../auth'

type UserRequest = Request & { user: any }

export default (req: Request, res: Response) => {
  const interestingHeaders = req.rawHeaders.reduce(
    (p: string[], v: string, i) =>
      i % 2 ? p : [...p, `${v}: ${req.rawHeaders[i + 1]}`],
    []
  )

  const ai = authInfo(req as UserRequest)
  res.render('dashboard', {
    session: ai.claims.session,
    token: ai,
    headers: `GET ${req.path} HTTP/1.1

${interestingHeaders
  .filter((header: string) =>
    /User-Agent|Authorization|Content-Type|Host|Accept-Encoding|Accept-Language|Cookie|Connection|X-Forwarded-For/.test(
      header
    )
  )
  .join('\n')}
...`,
  })
}
