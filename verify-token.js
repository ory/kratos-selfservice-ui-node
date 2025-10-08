const fs = require('fs');
const jwt = require('jsonwebtoken');
const pub = fs.readFileSync('./infra/jwks/public.pem','utf8');
const token = fs.readFileSync('./token_clean.txt','utf8').trim();
try {
  const payload = jwt.verify(token, pub, { algorithms: ['RS256'], audience: 'oathkeeper', issuer: 'local-dev' });
  console.log('✅ Signature + claims OK');
  console.log(JSON.stringify(payload, null, 2));
} catch (err) {
  console.error('❌ Verify failed:', err && err.message);
  process.exit(2);
}
