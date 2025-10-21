router.get("/", requireAdminAudit, async (req, res) => {
    const { subject, relation, object } = req.query
    if (!subject || !relation || !object) {
        return res.status(400).json({ error: "subject, relation, and object are required" })
    }

    try {
        const ketoRes = await fetch(`${process.env.KETO_ADMIN_URL}/admin/relation-tuples/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.KETO_ADMIN_TOKEN}`,
            },
            body: JSON.stringify({ subject, relation, object }),
        })

        const body = await ketoRes.json()
        return res.status(200).json({ allowed: body.allowed })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})
