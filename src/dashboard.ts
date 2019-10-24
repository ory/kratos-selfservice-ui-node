import { Request, Response } from 'express'
import config from './config'

export default (req: Request, res: Response) => {
  const interestingHeaders = req.rawHeaders.reduce((p: string[], v: string, i) => i % 2 ? p : [...p, `${v}: ${req.rawHeaders[i+1]}`], [])

  res.render('dashboard', {
    session: (req as any).user,
    headers: `
GET ${req.path} HTTP/1.1

${interestingHeaders.filter((header: string) => /User-Agent|Authorization|Content-Type|Host|Accept-Encoding|Accept-Language|Connection|X-Forwarded-For/.test(header)).join("\n")}
...`,
    logoutUrl: `${config.hive.public}/auth/browser/logout`,
  })
}
