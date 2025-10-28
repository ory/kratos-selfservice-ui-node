import { Router, Request, Response } from "express";
import { getKratosIdentityByEmail } from "../lib/kratosClient";
import pino from "pino";
import path from "path";
import fs from "fs";
import { createTenantRow } from "../lib/db/transactions";

const router = Router();

// Setup audit logger
const auditLogPath = path.resolve(__dirname, "../../infra/logs/audit.log");
fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
const logger = pino(
    { level: "info", timestamp: pino.stdTimeFunctions.isoTime },
    pino.destination({ dest: auditLogPath, sync: false })
);

// 🟢 GET /admin/identities?email=someone@example.com
router.get("/identities", async (req: Request, res: Response) => {
    const email = req.query.email as string;

    if (!email) {
        return res.status(400).json({ error: "Missing email query parameter" });
    }

    try {
        const identity = await getKratosIdentityByEmail(email);

        logger.info({
            event: "admin.identities.get",
            actor: req.user?.sub,
            email,
            found: !!identity,
            path: req.path,
            ip: req.ip,
        });

        if (!identity) {
            return res.status(404).json({ error: "Identity not found" });
        }

        return res.status(200).json({ identity });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        logger.error({
            event: "admin.identities.get",
            actor: req.user?.sub,
            email,
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: "Failed to fetch identity" });
    }
});
// 🟢 POST /admin/onboard
router.post("/onboard", async (req: Request, res: Response) => {
    const { name, subdomain } = req.body;

    if (!name || !subdomain) {
        return res.status(400).json({ error: "Missing name or subdomain" });
    }

    try {
        const result = await createTenantRow({ name, subdomain });

        logger.info({
            event: "admin.onboard.create",
            actor: req.user?.sub,
            tenantId: result.tenantId,
            name,
            subdomain,
            path: req.path,
            ip: req.ip,
        });

        return res.status(201).json({
            message: "Tenant onboarded",
            tenantId: result.tenantId,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);

        logger.error({
            event: "admin.onboard.create",
            actor: req.user?.sub,
            name,
            subdomain,
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: "Failed to onboard tenant" });
    }
});


export default router;
