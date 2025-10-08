// mint-jwt-file.js (place in repo root)
const fs = require("fs");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync("./infra/jwks/private.pem", "utf8");

const token = jwt.sign(
    {
        scope: "admin",
        tenant: "t001",
    },
    privateKey,
    {
        algorithm: "RS256",
        keyid: "local-dev-1",
        issuer: "local-dev",
        audience: "oathkeeper",
        subject: "tester-123",
        expiresIn: "10m",
    }
);

// write to file and also print (so you can see it)
fs.writeFileSync("./token.txt", token, { encoding: "utf8" });
console.log("Wrote ./token.txt");
console.log(token);
