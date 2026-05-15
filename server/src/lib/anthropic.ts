import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult } from "../types/index.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildFallbackSummary(audit: AuditResult): string {
  const { totalMonthlySpend, totalMonthlySavings, totalAnnualSavings, input } = audit;

  if (totalMonthlySavings < 100) {
    return `Your ${input.teamSize}-person team is spending $${totalMonthlySpend}/month on AI tools and appears well-optimised for your ${input.useCase} workflows. No significant waste was detected in your current stack. We recommend re-running this audit when your team grows past 15 people or when you adopt new AI tooling, as plan thresholds and seat minimums shift meaningfully at scale.`;
  }

  const topRec = audit.recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  return `Your ${input.teamSize}-person team is spending $${totalMonthlySpend}/month on AI tools — $${totalMonthlySavings} of which appears addressable through plan right-sizing and consolidation. The largest single opportunity is ${topRec?.toolName ?? "your current stack"}: ${topRec?.reasoning.split(".")[0]}. Acting on these recommendations would save $${totalAnnualSavings} per year with no reduction in AI capability. For significant spends, Credex can unlock additional savings through discounted enterprise credits.`;
}

export async function generateAuditSummary(audit: AuditResult): Promise<string> {
  const toolBreakdown = audit.recommendations
    .map(
      (r) =>
        `${r.toolName} (${r.currentPlan}): $${r.currentSpend}/mo, potential savings $${r.monthlySavings}/mo via ${r.actionType}`
    )
    .join("; ");

  const prompt = `You are a CFO-level financial advisor writing a concise, credible AI spend audit summary for a startup.

Audit data:
- Team size: ${audit.input.teamSize} people
- Primary use case: ${audit.input.useCase}
- Current total AI spend: $${audit.totalMonthlySpend}/month
- Identified savings: $${audit.totalMonthlySavings}/month ($${audit.totalAnnualSavings}/year)
- Savings as % of spend: ${audit.savingsPercentage}%
- Tool breakdown: ${toolBreakdown}

Write an 80-110 word summary paragraph that:
1. Opens with a specific, non-generic observation about their spending pattern
2. Names the 1-2 largest concrete savings opportunities with exact dollar figures
3. Provides one clear next-step action
4. Closes with what this means in annual terms

Tone rules:
- Write like a CFO who has reviewed hundreds of software spend reports
- Be direct. No "great news!", no motivational fluff, no generic openers
- Cite specific dollar amounts and percentages
- One paragraph only. No lists. No headers.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === "text") return content.text.trim();
    return buildFallbackSummary(audit);
  } catch (err) {
    console.error("Anthropic API error:", err);
    return buildFallbackSummary(audit);
  }
}
