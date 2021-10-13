import { Query } from 'express-serve-static-core'

export function withReturnTo(
  url: string,
  query: Query,
  flow?: { return_to?: string }
) {
  let u = new URLSearchParams()
  if (url.indexOf('?') === -1) {
    u = new URLSearchParams(url.split('?')[1])
  }

  // If AAL (e.g. 2FA) is requested, forward that to the initialization API
  if (query.aal) {
    u.set('aal', query.aal.toString())
  }

  // If refresh is requested, forward that to the initialization API
  if (query.refresh) {
    u.set('refresh', 'true')
  }

  // If return_to is requested, forward that to the initialization API
  if (typeof query.return_to === 'string') {
    u.set('return_to', query.return_to)
    return url + '?' + u.toString()
  }

  if (flow?.return_to) {
    u.set('return_to', flow.return_to)
    return url + '?' + u.toString()
  }

  return url
}
