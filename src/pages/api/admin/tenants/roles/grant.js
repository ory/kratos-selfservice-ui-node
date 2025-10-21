import { Router } from "express"
import fetch from "node-fetch"
import requireAdminAudit from "../../../src/lib/requireAdmin.audit"

const router = Router()

router.post("/", requireAdminAudit, async (req, res) => {
    const { subject, relation, object } = req.body
    if (!subject || !relation || !object) {
        return res.status(400).json({ error: "subject, relation, and object are required" })
    }

    try {
        const ketoRes = await fetch(`${process.env.KETO_ADMIN_URL}/admin/relation-tuples`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.KETO_ADMIN_TOKEN}`,
            },
            body: JSON.stringify({ subject, relation, object }),
        })

        if (!ketoRes.ok) {
            const err = await ketoRes.text()
            throw new Error(`Keto role grant failed: ${err}`)
        }

        req.auditLog({
            event: "keto.role.grant",
            actor: req.user?.sub,
            subject,
            relation,
            object,
            result: "granted",
            path: req.path,
            ip: req.ip,
        })

        return res.status(201).json({ message: "Role granted successfully" })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

export default router
