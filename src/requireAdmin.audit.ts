import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import fs from "fs"
import path from "path"
import pino from "pino"
import jwkToPem from "jwk-to-pem"

// Extend Express Request to include `user`
declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

// Load JWKS and convert to PEM
const jwkPath = path.resolve("infra/jwks/.well-known/jwks.json")
const jwks = JSON.parse(fs.readFileSync(jwkPath, "utf-8"))
const publicKey = jwkToPem(jwks.keys[0])

// Setup logger
const auditLogPath = path.resolve("infra/logs/audit.log")
fs.mkdirSync(path.dirname(auditLogPath), { recursive: true })

const logger = pino(
    { level: "info", timestamp: pino.stdTimeFunctions.isoTime },
    pino.destination({ dest: auditLogPath, sync: false })
)

export default function requireAdminAudit(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        logger.warn({ event: "auth.missing", path: req.path })
        return res.status(401).json({ error: "Missing Authorization header" })
    }

    try {
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"],
            audience: "oathkeeper",
            issuer: "local-dev",
        }) as any

        logger.info({
            event: "auth.valid",
            sub: decoded.sub,
            scope: decoded.scope,
            tenant: decoded.tenant,
            path: req.path,
            ip: req.ip,
            method: req.method,
        })

        if (decoded.scope !== "admin") {
            logger.warn({ event: "auth.denied", reason: "Not admin", sub: decoded.sub })
            return res.status(403).json({ error: "Forbidden: admin scope required" })
        }

        req.user = decoded
        next()
    } catch (err: any) {
        logger.error({ event: "auth.invalid", error: err.message, path: req.path })
        return res.status(403).json({ error: "Invalid or expired token" })
    }
}
