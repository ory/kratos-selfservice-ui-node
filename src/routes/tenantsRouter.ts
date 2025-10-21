import { Router, Request, Response } from "express";
import {
    createKratosIdentity,
    updateKratosIdentity,
    deleteKratosIdentity,
    getKratosIdentityByEmail,
    KratosIdentity,
} from "../lib/kratosClient";
import {
    grantRole,
    checkRole,
    revokeRole,
} from "../lib/ketoClient";
import requireAdminAudit from "../lib/requireAdmin.audit";
import pino from "pino";
import path from "path";
import fs from "fs";

const router = Router();

// Setup audit logger
const auditLogPath = path.resolve(__dirname, "../../infra/logs/audit.log");
fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
const logger = pino(
    { level: "info", timestamp: pino.stdTimeFunctions.isoTime },
    pino.destination({ dest: auditLogPath, sync: false })
);

// 🟢 POST /admin/onboard (public)
router.post("/onboard", async (req: Request, res: Response) => {
    const { email, tenant_id, roles } = req.body;

    if (!email || !tenant_id || !roles || !Array.isArray(roles)) {
        return res.status(400).json({ error: "email, tenant_id, and roles[] are required" });
    }

    try {
        const existing = await getKratosIdentityByEmail(email);
        let identity: KratosIdentity;

        if (existing) {
            await updateKratosIdentity(existing.id, { email, tenant_id, roles });
            identity = existing;

            logger.info({
                event: "tenant.onboard",
                actor: req.user?.sub,
                tenant_id,
                email,
                roles,
                result: "updated",
                path: req.path,
                ip: req.ip,
            });
        } else {
            identity = await createKratosIdentity({ email, tenant_id, roles });

            logger.info({
                event: "tenant.onboard",
                actor: req.user?.sub,
                tenant_id,
                email,
                roles,
                result: "created",
                path: req.path,
                ip: req.ip,
            });
        }

        // 🔁 Grant roles with rollback on failure
        const grantedRoles: string[] = [];

        for (const role of roles) {
            try {
                if (role === "invalid_role") {
                    throw new Error("Simulated failure for testing rollback");
                }
                await grantRole(email, role, tenant_id);
                grantedRoles.push(role);

                logger.info({
                    event: "roles.grant",
                    actor: req.user?.sub,
                    subject_id: email,
                    relation: role,
                    object: tenant_id,
                    result: "granted",
                    path: req.path,
                    ip: req.ip,
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);

                logger.error({
                    event: "roles.grant",
                    actor: req.user?.sub,
                    subject_id: email,
                    relation: role,
                    object: tenant_id,
                    error: message,
                    path: req.path,
                    ip: req.ip,
                });

                // 🔄 Rollback previously granted roles
                for (const granted of grantedRoles) {
                    try {
                        await revokeRole(email, granted, tenant_id);
                        logger.info({
                            event: "roles.rollback",
                            actor: req.user?.sub,
                            subject_id: email,
                            relation: granted,
                            object: tenant_id,
                            result: "revoked",
                            path: req.path,
                            ip: req.ip,
                        });
                    } catch (rollbackErr) {
                        logger.error({
                            event: "roles.rollback",
                            actor: req.user?.sub,
                            subject_id: email,
                            relation: granted,
                            object: tenant_id,
                            error: rollbackErr instanceof Error ? rollbackErr.message : String(rollbackErr),
                            path: req.path,
                            ip: req.ip,
                        });
                    }
                }

                return res.status(500).json({ error: "Role grant failed. Rolled back." });
            }
        }

        return res.status(201).json({
            message: existing ? "Identity updated successfully" : "Tenant onboarded successfully",
            identity,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        logger.error({
            event: "tenant.onboard",
            actor: req.user?.sub,
            tenant_id,
            email,
            roles,
            result: "error",
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: message });
    }
});

// 🟢 POST /admin/tenants/roles/grant (protected)
router.post("/roles/grant", requireAdminAudit, async (req: Request, res: Response) => {
    const { subject_id, relation, object } = req.body;

    if (!subject_id || !relation || !object) {
        return res.status(400).json({ error: "subject_id, relation, and object are required" });
    }

    try {
        const result = await grantRole(subject_id, relation, object);

        logger.info({
            event: "roles.grant",
            actor: req.user?.sub,
            subject_id,
            relation,
            object,
            result,
            path: req.path,
            ip: req.ip,
        });

        return res.status(200).json({ message: "Role granted successfully", result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        logger.error({
            event: "roles.grant",
            actor: req.user?.sub,
            subject_id,
            relation,
            object,
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: "Failed to grant role" });
    }
});

// 🟢 POST /admin/tenants/roles/check (public)
router.post("/roles/check", async (req: Request, res: Response) => {
    const { subject_id, relation, object } = req.body;

    if (!subject_id || !relation || !object) {
        return res.status(400).json({ error: "subject_id, relation, and object are required" });
    }

    try {
        const allowed = await checkRole(subject_id, relation, object);

        logger.info({
            event: "roles.check",
            subject_id,
            relation,
            object,
            allowed,
            path: req.path,
            ip: req.ip,
        });

        return res.status(200).json({ allowed });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        logger.error({
            event: "roles.check",
            subject_id,
            relation,
            object,
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: "Failed to check role" });
    }
});

// 🟢 POST /admin/tenants/roles/revoke (protected)
router.post("/roles/revoke", requireAdminAudit, async (req: Request, res: Response) => {
    const { subject_id, relation, object } = req.body;

    if (!subject_id || !relation || !object) {
        return res.status(400).json({ error: "subject_id, relation, and object are required" });
    }

    try {
        const result = await revokeRole(subject_id, relation, object);

        logger.info({
            event: "roles.revoke",
            actor: req.user?.sub,
            subject_id,
            relation,
            object,
            result,
            path: req.path,
            ip: req.ip,
        });

        return res.status(200).json({ message: "Role revoked successfully", result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        logger.error({
            event: "roles.revoke",
            actor: req.user?.sub,
            subject_id,
            relation,
            object,
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: "Failed to revoke role" });
    }
});

// 🟢 GET /admin/tenants/:id (protected)
router.get("/:id", requireAdminAudit, async (req: Request, res: Response) => {
    const tenantId = req.params.id;

    try {
        const identity = await getKratosIdentityByEmail(`${tenantId}@example.com`);

        if (!identity) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        logger.info({
            event: "tenant.get",
            actor: req.user?.sub,
            tenant_id: tenantId,
            path: req.path,
            ip: req.ip,
        });

        return res.status(200).json({ tenant_id: tenantId, identity });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        logger.error({
            event: "tenant.get",
            actor: req.user?.sub,
            tenant_id: tenantId,
            error: message,
            path: req.path,
            ip: req.ip,
        });

        return res.status(500).json({ error: "Failed to fetch tenant" });
    }
});

export default router;
