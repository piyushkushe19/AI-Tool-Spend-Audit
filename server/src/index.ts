import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import auditRouter from "./routes/audit.js";
import leadsRouter from "./routes/leads.js";
import { generalLimiter } from "./middleware/rate-limit.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(generalLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/audit", auditRouter);
app.use("/api/leads", leadsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 SpendLens API running on port ${PORT}`);
});

export default app;
