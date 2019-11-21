import { Request, Response } from 'express'
import config from './config'

const exampleJsonWebTokenClaims = `{
  "authenticated_at": "0001-01-01T00:00:00Z",
  "exp": 1571995718,
  "expires_at": "2019-10-25T10:27:37.938173Z",
  "iat": 1571995658,
  "identity": {
    "id": "1782dd88-639e-4321-b4f8-efd838bb21af",
    "traits": {
      "email": "asdf@sdfög.as"
    },
    "traits_schema_url": "http://backoffice.kernel.svc.cluster.local/presets/schemas/identity.email.schema.json"
  },
  "iss": "http://console.cloud.ory.local/",
  "issued_at": "2019-10-25T09:27:37.938187Z",
  "jti": "fec59b8f-42ad-4fd5-8ac7-1c21d86709e3",
  "nbf": 1571995658,
  "sid": "cd69ec39-f9bb-4ba9-b19d-e0389b05924b",
  "sub": "1782dd88-639e-4321-b4f8-efd838bb21af"
}`

export default (req: Request, res: Response) => {
  const interestingHeaders = req.rawHeaders.reduce(
    (p: string[], v: string, i) =>
      i % 2 ? p : [...p, `${v}: ${req.rawHeaders[i + 1]}`],
    []
  )

  res.render('dashboard', {
    identity: ((req as any).user || JSON.parse(exampleJsonWebTokenClaims)).identity,
    session: (req as any).user
      ? JSON.stringify((req as any).user, null, 2)
      : exampleJsonWebTokenClaims,
    headers: `GET ${req.path} HTTP/1.1

${interestingHeaders
  .filter((header: string) =>
    /User-Agent|Authorization|Content-Type|Host|Accept-Encoding|Accept-Language|Connection|X-Forwarded-For/.test(
      header
    )
  )
  .join('\n')}
...`,
    logoutUrl: `${config.kratos.browser}/auth/browser/logout`,
  })
}
