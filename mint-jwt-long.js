const fs = require('fs');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync('./infra/jwks/private.pem','utf8');

const token = jwt.sign(
  { scope: 'admin', tenant: 't001' },
  privateKey,
  {
    algorithm: 'RS256',
    keyid: 'local-dev-1',
    issuer: 'local-dev',
    audience: 'oathkeeper',
    subject: 'tester-123',
    expiresIn: '1h'
  }
);

fs.writeFileSync('./token_clean.txt', token.replace(/\r?\n/g,''), 'utf8');
console.log('Wrote ./token_clean.txt (1h)');
