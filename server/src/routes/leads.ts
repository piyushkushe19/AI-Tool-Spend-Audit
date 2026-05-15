import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { sendAuditEmail } from "../lib/resend.js";
import { leadLimiter } from "../middleware/rate-limit.js";
import type { ApiResponse } from "../types/index.js";

const router = Router();

const leadSchema = z.object({
  auditId: z.string().uuid(),
  email: z.string().email("Enter a valid email address"),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  // Honeypot field — must be empty
  website: z.string().max(0, "").optional(),
});

router.post("/", leadLimiter, async (req, res) => {
  // Honeypot check
  if (req.body?.website) {
    return res.json({ success: true }); // silent success to fool bots
  }

  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } satisfies ApiResponse);
  }

  const { auditId, email, companyName, role, teamSize } = parsed.data;

  // Fetch the audit to include in the email
  let audit = null;
  try {
    const { data } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();
    audit = data;
  } catch {
    // proceed without audit data
  }

  // Save lead to DB
  try {
    const { error } = await supabase.from("leads").insert({
      audit_id: auditId,
      email,
      company_name: companyName ?? null,
      role: role ?? null,
      team_size: teamSize ?? null,
      total_monthly_savings: audit?.total_monthly_savings ?? null,
    });

    if (error) console.error("Lead insert error:", error);
  } catch (err) {
    console.error("Lead DB error:", err);
  }

  // Send transactional email (non-blocking)
  if (audit) {
    const auditResult = {
      id: audit.id,
      input: audit.input,
      recommendations: audit.recommendations,
      totalMonthlySpend: audit.total_monthly_spend,
      totalMonthlySavings: audit.total_monthly_savings,
      totalAnnualSavings: audit.total_annual_savings,
      optimizedMonthlySpend: audit.optimized_monthly_spend,
      savingsPercentage: audit.savings_percentage,
      summary: audit.summary,
      createdAt: audit.created_at,
    };

    sendAuditEmail({ email, companyName, audit: auditResult }).catch(console.error);
  }

  return res.json({ success: true });
});

export default router;
