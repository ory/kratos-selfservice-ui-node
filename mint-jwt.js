const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load private key
const privateKeyPath = path.resolve(__dirname, './infra/jwks/private.pem');
if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ private.pem not found at:', privateKeyPath);
    process.exit(1);
}
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

// Define JWT payload
const payload = {
    scope: 'admin',
    tenant: 't001',
    sub: 'tester-123',
    aud: 'oathkeeper',
    iss: 'local-dev'
};

// Sign the token (valid for 59 minutes)
const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '59m',
    keyid: 'local-dev-1'
});

// Save token to file
const tokenPath = path.resolve(__dirname, 'token.txt');
fs.writeFileSync(tokenPath, token);

console.log('\n✅ New JWT minted successfully:\n');
console.log(token);
console.log('\n📁 Token saved to:', tokenPath);
console.log('\n📡 Use this token in Postman or curl:\n');
console.log(`Authorization: Bearer ${token}`);
