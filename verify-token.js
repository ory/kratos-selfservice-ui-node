const fs = require("fs");
const jwt = require("jsonwebtoken");

const publicKey = fs.readFileSync("./infra/jwks/public.pem", "utf8");
let token = "";

try {
  token = fs.readFileSync("token.txt", "utf8").trim();
  if (!token) throw new Error("Token file is empty or missing.");
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer: "local-dev",
    audience: "oathkeeper"
  });
  console.log("JWT is valid. Payload:", decoded);
} catch (err) {
  console.error("JWT verification failed:", err.message);
}