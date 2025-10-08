const fs = require("fs");
const jwt = require("jsonwebtoken");
const key = fs.readFileSync("./infra/jwks/private.pem", "utf8");

const token = jwt.sign(
    { scope: "admin", tenant: "t001" },
    key,
    {
        algorithm: "RS256",
        keyid: "local-dev-1",
        issuer: "local-dev",
        audience: "oathkeeper",
        subject: "tester-123",
        expiresIn: "10m"
    }
);

console.log(token);
