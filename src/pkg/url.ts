import { Query } from 'express-serve-static-core'

export function withReturnTo(
  url: string,
  query: Query,
  flow?: { request_url: string }
) {
  let u = new URLSearchParams()
  if (url.indexOf('?') === -1) {
    u = new URLSearchParams(url.split('?')[1])
  }

  // If AAL (e.g. 2FA) is requested, forward that to Ory Kratos
  if (query.aal) {
    u.set('aal', query.aal.toString())
  }

  // If refresh is requested, forward that to Ory Kratos
  if (query.refresh) {
    u.set('refresh', 'true')
  }

  if (typeof query.return_to === 'string') {
    u.set('return_to', query.return_to)
    return url + '?' + u.toString()
  }

  if (flow) {
    const ru = new URL(flow.request_url)
    if (ru.searchParams.has('return_to')) {
      u.set('return_to', ru.searchParams.get('return_to') as string)
      return url + '?' + u.toString()
    }
  }

  return url
}
