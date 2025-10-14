import express from "express"
import adminRouter from "./routes/admin"
import requireAdminAudit from "./lib/requireAdmin.audit"


const app = express()

app.use(express.json())

// ✅ Protected admin route
app.use("/admin", requireAdminAudit, adminRouter)

// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok" }))

// ✅ Start the server
app.listen(4000, () => {
    console.log("✅ Admin API running on http://localhost:4000")
})
