import { Request, Response } from 'express'
import { Configuration, PublicApi } from '@ory/kratos-client'
import jd from 'jwt-decode'

import config from '../config'
import { isString, redirectOnSoftError } from '../helpers/sdk'

// Variable config has keys:
// kratos: {
//
//   // The browser config key is used to redirect the user. It reflects where ORY Kratos' Public API
//   // is accessible from. Here, we're assuming traffic going to `http://example.org/.ory/kratos/public/`
//   // will be forwarded to ORY Kratos' Public API.
//   browser: 'https://kratos.example.org',
//
//   // The location of the ORY Kratos Admin API
//   admin: 'https://ory-kratos-admin.example-org.vpc',
//
//   // The location of the ORY Kratos Public API within the cluster
//   public: 'https://ory-kratos-public.example-org.vpc',
// },

// Uses the ORY Kratos NodeJS SDK - for more SDKs check:
//
//  https://www.ory.sh/kratos/docs/sdk/index
const kratos = new PublicApi(
  new Configuration({ basePath: config.kratos.public })
)

type UserRequest = Request & { user: any }

const authInfo = (req: UserRequest) => {
  if (config.securityMode === config.SECURITY_MODE_JWT) {
    const bearer = req.header('authorization')
    if (bearer) {
      // The header will be in format of `Bearer eyJhbGci...`. We therefore split at the whitespace to get the token
      // itself only.
      let token = bearer.split(' ')[1]
      return {
        raw: token,
        claims: req.user,
      }
    }
  } else {
    const session = req.cookies.ory_kratos_session
    if (session) {
      return {
        raw: session,
        claims: req.user,
      }
    }
  }

  // In the demo mode, the token will not be available in the header. Instead, we'll use this example token:
  const token =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEyYWE5NzM5LWQ3NTMtNGEwZC04N2VlLTYxZjEwMTA1MDI3NyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Nzg5MjU0MTMsImlhdCI6MTU3ODkyNTM1MywiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo0NDU1LyIsImp0aSI6ImM3NDhjYzc4LTJlOTAtNGVhNi1iNTdmLTA3YmI4YjNlNGUxYyIsIm5iZiI6MTU3ODkyNTM1Mywic2Vzc2lvbiI6eyJhdXRoZW50aWNhdGVkX2F0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJleHBpcmVzX2F0IjoiMjAyMC0wMS0wOVQxOTozMDoxMC43MzM4NDRaIiwiaWRlbnRpdHkiOnsiaWQiOiJlM2IxZmM2MS0wMjMxLTQwODMtYjQ3MC0yODkwMDE2ZmY5ZmUiLCJ0cmFpdHMiOnsiZW1haWwiOiJoaWxhZnNkaG9pdWFmZHNAYXNkZi5kZSJ9LCJ0cmFpdHNfc2NoZW1hX3VybCI6ImZpbGU6Ly8vZXRjL2NvbmZpZy9rcmF0b3MvaWRlbnRpdHkudHJhaXRzLnNjaGVtYS5qc29uIn0sImlzc3VlZF9hdCI6IjIwMjAtMDEtMDlUMTg6MzA6MTAuNzMzOTMwNVoiLCJzaWQiOiI5NWQwMWNkYy1kMGY2LTQ1Y2MtODdlYi02NTA1ZTRkYTlkNTcifSwic3ViIjoiZTNiMWZjNjEtMDIzMS00MDgzLWI0NzAtMjg5MDAxNmZmOWZlIn0.JZVmc-EG-1k5RB7W4mouU6ycrRVJPimNUZXL59fwnIWKokhzV0itgYXm4eFV5VDYSt5S7VQgK7PmJFqYaaLtdz1yqqACH4E19VSanwB57mKCawePSvHIYnCnQW0E8vr9RavQPeluMfDS239FMow7-kq1ydkKVryhImfllW2pmAXC-0K9_0BE584u4RV7Ki0rGG2xhb8DelHpHurXStFRzi2BDW_J5xn1zlb9QyYEThX17KnXRJZkJpmTUgUBPGfUHSL6-267YgkIGKzVgCQ0dBFfAX4vDqL4qthNP3K9iS404jXLSrwYvTN6Y_xI-B-WCSqXX3PGBTnMgKB5pCsiPA'
  return {
    raw: token,
    // We use `jwt-decoder` here to decode the token header and display it in the dashboard.
    // BE AWARE THAT `jwt-decoder` DOES NOT VALIDATE THE TOKEN, it just decodes it. This method is not secure
    // in a real-world scenario, but we use it here to decode and display the token header!
    claims: jd(token),
  }
}

export default (req: Request, res: Response) => {
  const interestingHeaders = req.rawHeaders.reduce(
    (p: string[], v: string, i) =>
      i % 2 ? p : [...p, `${v}: ${req.rawHeaders[i + 1]}`],
    []
  )

  const ai = authInfo(req as UserRequest)

  kratos
    .createSelfServiceLogoutUrlForBrowsers(req.header('Cookie'))
    .then(({ data }) => {
      res.render('dashboard', {
        session: ai.claims.session,
        token: ai,
        logoutUrl: data.logout_url,
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
    })
}
