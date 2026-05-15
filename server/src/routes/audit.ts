import { Router } from "express";
import { z } from "zod";
import { runAudit } from "../lib/audit-engine.js";
import { generateAuditSummary } from "../lib/anthropic.js";
import { supabase } from "../lib/supabase.js";
import { auditLimiter } from "../middleware/rate-limit.js";
import type { ApiResponse, AuditResult } from "../types/index.js";

const router = Router();

const toolEntrySchema = z.object({
  id: z.string(),
  tool: z.enum([
    "cursor",
    "github_copilot",
    "claude",
    "chatgpt",
    "openai_api",
    "anthropic_api",
    "gemini",
    "windsurf",
  ]),
  plan: z.string().min(1),
  monthlySpend: z.number().min(0).max(100000),
  seats: z.number().int().min(1).max(10000),
});

const auditInputSchema = z.object({
  tools: z.array(toolEntrySchema).min(1).max(20),
  teamSize: z.number().int().min(1).max(100000),
  useCase: z.enum(["coding", "writing", "research", "mixed", "data_analysis"]),
});

// POST /api/audit — run audit and persist
router.post("/", auditLimiter, async (req, res) => {
  const parsed = auditInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } satisfies ApiResponse);
  }

  const auditResult = runAudit(parsed.data);

  // Generate AI summary (non-blocking — fallback handled inside)
  try {
    auditResult.summary = await generateAuditSummary(auditResult);
  } catch {
    // summary stays undefined — results page handles this
  }

  // Persist to Supabase
  try {
    const { error } = await supabase.from("audits").insert({
      id: auditResult.id,
      input: auditResult.input,
      recommendations: auditResult.recommendations,
      total_monthly_spend: auditResult.totalMonthlySpend,
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
      optimized_monthly_spend: auditResult.optimizedMonthlySpend,
      savings_percentage: auditResult.savingsPercentage,
      summary: auditResult.summary ?? null,
      created_at: auditResult.createdAt,
    });

    if (error) console.error("Supabase insert error:", error);

    // Insert per-tool rows
    const toolRows = auditResult.recommendations.map((r) => ({
      audit_id: auditResult.id,
      tool_name: r.toolName,
      plan: r.currentPlan,
      monthly_spend: r.currentSpend,
      seats: auditResult.input.tools.find((t) => t.id === r.toolId)?.seats ?? 1,
      monthly_savings: r.monthlySavings,
      recommended_plan: r.recommendedPlan,
    }));

    await supabase.from("audit_tools").insert(toolRows);
  } catch (err) {
    console.error("DB persistence error:", err);
    // Don't fail the response — return result even if DB write fails
  }

  return res.json({ success: true, data: auditResult } satisfies ApiResponse<AuditResult>);
});

// GET /api/audit/:id — fetch public audit by ID (strips personal data)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id?.match(/^[0-9a-f-]{36}$/)) {
    return res.status(400).json({ success: false, error: "Invalid audit ID" });
  }

  try {
    const { data, error } = await supabase
      .from("audits")
      .select(
        "id, recommendations, total_monthly_spend, total_monthly_savings, total_annual_savings, optimized_monthly_spend, savings_percentage, summary, created_at, input"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: "Audit not found" });
    }

    // Strip personal identifiers from input for public view
    const publicResult = {
      ...data,
      input: {
        teamSize: data.input.teamSize,
        useCase: data.input.useCase,
        tools: data.input.tools.map((t: { tool: string; plan: string; seats: number; monthlySpend: number; id: string }) => ({
          tool: t.tool,
          plan: t.plan,
          seats: t.seats,
          monthlySpend: t.monthlySpend,
          id: t.id,
        })),
      },
    };

    return res.json({ success: true, data: publicResult });
  } catch (err) {
    console.error("Audit fetch error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
