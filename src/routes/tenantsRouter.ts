import { Router, Request, Response } from "express"
import { createKratosIdentity } from "../lib/kratosClient"
import pino from "pino"
import path from "path"
import fs from "fs"

const router = Router()

// Setup audit logger
const auditLogPath = path.resolve("infra/logs/audit.log")
fs.mkdirSync(path.dirname(auditLogPath), { recursive: true })
const logger = pino(
    { level: "info", timestamp: pino.stdTimeFunctions.isoTime },
    pino.destination({ dest: auditLogPath, sync: false })
)

router.post("/onboard", async (req: Request, res: Response) => {
    const { email, tenant_id, roles } = req.body

    if (!email || !tenant_id || !roles || !Array.isArray(roles)) {
        return res.status(400).json({ error: "email, tenant_id, and roles[] are required" })
    }

    try {
        const identity = await createKratosIdentity({ email, tenant_id, roles })

        logger.info({
            event: "tenant.onboard",
            actor: req.user?.sub,
            tenant_id,
            email,
            roles,
            result: "success",
            path: req.path,
            ip: req.ip,
        })

        res.status(201).json({
            message: "Tenant onboarded successfully",
            identity,
        })
    } catch (err: any) {
        logger.error({
            event: "tenant.onboard",
            actor: req.user?.sub,
            tenant_id,
            email,
            roles,
            result: "error",
            error: err.message,
            path: req.path,
            ip: req.ip,
        })

        res.status(500).json({ error: err.message })
    }
})

export default router
