import { Router, Request, Response } from "express"
import {
    createKratosIdentity,
    updateKratosIdentity,
    deleteKratosIdentity,
    getKratosIdentityByEmail,
    KratosIdentity,
} from "../lib/kratosClient"
import { bootstrapTenantRoles } from "../lib/ketoClient"
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
        const existing = await getKratosIdentityByEmail(email)

        let identity: KratosIdentity

        if (existing) {
            await updateKratosIdentity(existing.id, {
                email,
                tenant_id,
                roles: roles.join(","),
            })

            identity = existing

            logger.info({
                event: "tenant.onboard",
                actor: req.user?.sub,
                tenant_id,
                email,
                roles,
                result: "updated",
                path: req.path,
                ip: req.ip,
            })
        } else {
            identity = await createKratosIdentity({ email, tenant_id, roles })

            logger.info({
                event: "tenant.onboard",
                actor: req.user?.sub,
                tenant_id,
                email,
                roles,
                result: "created",
                path: req.path,
                ip: req.ip,
            })
        }

        try {
            const status = await bootstrapTenantRoles(tenant_id)

            logger.info({
                event: "keto.bootstrap",
                actor: req.user?.sub,
                tenant_id,
                result: status,
                path: req.path,
                ip: req.ip,
            })

            return res.status(201).json({
                message: existing ? "Identity updated successfully" : "Tenant onboarded successfully",
                identity,
            })
        } catch (ketoErr: any) {
            if (!existing) {
                await deleteKratosIdentity(identity.id)
            }

            logger.error({
                event: "keto.bootstrap",
                actor: req.user?.sub,
                tenant_id,
                result: "rollback",
                error: ketoErr.message,
                path: req.path,
                ip: req.ip,
            })

            return res.status(500).json({ error: "Keto bootstrap failed. Identity rolled back." })
        }
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

        return res.status(500).json({ error: err.message })
    }
})

export default router
