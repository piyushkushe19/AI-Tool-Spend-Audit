import { Resend } from "resend";
import type { AuditResult } from "../types/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "audit@spendlens.io";
const APP_URL = process.env.APP_URL ?? "https://spendlens.io";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function buildEmailHtml(opts: {
  auditId: string;
  email: string;
  companyName?: string;
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isHighSavings: boolean;
  summary?: string;
}): string {
  const {
    auditId,
    companyName,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    isHighSavings,
    summary,
  } = opts;

  const auditUrl = `${APP_URL}/audit/${auditId}`;
  const savingsColor = totalMonthlySavings >= 100 ? "#16a34a" : "#374151";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;color:#111827">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">

  <!-- Header -->
  <tr><td style="background:#0f172a;padding:24px 32px">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;background:#22c55e;border-radius:6px;display:inline-block;margin-right:8px"></div>
      <span style="color:#fff;font-size:18px;font-weight:700">SpendLens</span>
      <span style="color:#94a3b8;font-size:13px;margin-left:4px">by Credex</span>
    </div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px">
    <p style="margin:0 0 8px;font-size:16px;color:#374151">
      Hi${companyName ? ` from ${companyName}` : ""},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280">
      Your AI spend audit is ready. Here's what we found:
    </p>

    <!-- Savings block -->
    <div style="background:${totalMonthlySavings >= 100 ? "#f0fdf4" : "#f9fafb"};border:1px solid ${totalMonthlySavings >= 100 ? "#bbf7d0" : "#e5e7eb"};border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Monthly savings identified</div>
      <div style="font-size:42px;font-weight:800;color:${savingsColor};line-height:1">${fmt(totalMonthlySavings)}</div>
      <div style="font-size:14px;color:#9ca3af;margin-top:4px">${fmt(totalAnnualSavings)}/year · from ${fmt(totalMonthlySpend)}/month current spend</div>
    </div>

    ${
      summary
        ? `<p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:24px;padding:16px;background:#f8fafc;border-left:3px solid #22c55e;border-radius:0 6px 6px 0">${summary}</p>`
        : ""
    }

    <a href="${auditUrl}" style="display:block;background:#16a34a;color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;margin-bottom:24px">
      View Full Audit Report →
    </a>

    ${
      isHighSavings
        ? `<div style="background:#0f172a;border-radius:8px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-weight:700;color:#fff;font-size:14px">💡 Unlock even more savings with Credex</p>
        <p style="margin:0 0 12px;font-size:13px;color:#94a3b8;line-height:1.6">Your audit shows significant AI spend. Credex sources discounted enterprise AI credits — typically 20-40% below retail — from companies that over-purchased. Our team can help you capture additional savings beyond what this audit surfaces.</p>
        <a href="https://credex.rocks?ref=spendlens" style="color:#22c55e;font-size:13px;font-weight:600;text-decoration:none">Book a free Credex consultation →</a>
      </div>`
        : ""
    }

    <p style="font-size:12px;color:#9ca3af;margin:0">You're receiving this because you ran an audit at SpendLens. No further emails unless you opt in. <a href="${APP_URL}" style="color:#6b7280">SpendLens</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendAuditEmail(opts: {
  email: string;
  companyName?: string;
  audit: AuditResult;
}): Promise<void> {
  const { email, companyName, audit } = opts;
  const isHighSavings = audit.totalMonthlySavings >= 500;

  const subject =
    audit.totalMonthlySavings > 0
      ? `Your AI audit: ${fmt(audit.totalMonthlySavings)}/mo in savings found`
      : "Your AI spend audit is ready";

  const html = buildEmailHtml({
    auditId: audit.id,
    email,
    companyName,
    totalMonthlySpend: audit.totalMonthlySpend,
    totalMonthlySavings: audit.totalMonthlySavings,
    totalAnnualSavings: audit.totalAnnualSavings,
    isHighSavings,
    summary: audit.summary,
  });

  try {
    await resend.emails.send({ from: FROM, to: email, subject, html });
  } catch (err) {
    console.error("Resend error:", err);
    // Don't throw — email failure should not break the lead capture flow
  }
}
