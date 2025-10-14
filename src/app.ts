import express from "express"
import cors from "cors"
import requireAdminAudit from "./lib/requireAdmin.audit"
import adminRouter from "./routes/adminRouter"
import tenantsRouter from "./routes/tenantsRouter"

const app = express()
app.use(cors())
app.use(express.json())

app.use("/admin", requireAdminAudit, adminRouter)
app.use("/admin/tenants", requireAdminAudit, tenantsRouter)

app.get("/health", (_, res) => res.json({ status: "ok" }))

export default app
