import express from "express";
import cors from "cors";
import adminRouter from "./routes/adminRouter";
import tenantsRouter from "./routes/tenantsRouter";
import requireAdminAudit from "./lib/requireAdmin.audit";

const app = express();

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🟢 Request logger
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl} from ${req.ip}`);
    next();
});

// 🟢 Public admin routes (e.g. /admin/identities)
app.use("/admin", adminRouter);

// 🟢 Public + protected tenant routes (e.g. /admin/tenants/onboard, /roles/grant)
app.use("/admin/tenants", tenantsRouter);

// 🟢 Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// 🔴 Fallback for unmatched routes
app.use((req, res) => {
    res.status(404).send(`Route not found: ${req.method} ${req.originalUrl}`);
});

export default app;
