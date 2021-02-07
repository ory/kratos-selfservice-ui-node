import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import config from '../config'

// This middleware assumes that the app is secured using ORY Oathkeeper, in which case we
// verify the JSON Web Token issued by ORY Oathkeeper using the jwt-express middleware.

export default jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secret: jwks.expressJwtSecret({
    cache: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.jwksUrl,
  }),
  algorithms: ['RS256'],
})
