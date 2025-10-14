import express from "express"
import adminRouter from "./routes/admin.js"
import requireAdminAudit from "./lib/requireAdmin.audit.js"

const app = express()

app.use("/admin", requireAdminAudit, adminRouter)

export default app