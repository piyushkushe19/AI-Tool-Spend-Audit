/**
 * SpendLens Audit Engine
 *
 * Pure deterministic logic — NO AI used here.
 * Every recommendation includes numerical + practical reasoning
 * written at a level a finance professional would trust.
 *
 * Design principle: hardcoded rules outperform LLMs for structured
 * financial analysis because they are reproducible, testable, and auditable.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  AuditInput,
  AuditResult,
  ToolRecommendation,
  SeverityLevel,
  ActionType,
} from "../types/index.js";
import {
  TOOL_CONFIGS,
  CODING_TOOLS,
  GENERAL_AI_TOOLS,
  getDisplayName,
} from "./pricing-data.js";

// ─── math helpers ─────────────────────────────────────────────────────────────

const r2 = (n: number) => Math.round(n * 100) / 100;
const annual = (monthly: number) => r2(monthly * 12);

function severityFromSavings(savings: number): SeverityLevel {
  if (savings <= 0) return "optimal";
  if (savings < 50) return "minor";
  if (savings < 200) return "moderate";
  return "significant";
}

// ─── per-tool rule sets ───────────────────────────────────────────────────────

function auditCursor(
  plan: string,
  spend: number,
  seats: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const plans = TOOL_CONFIGS.cursor.plans;

  // Non-coding team paying for a code editor
  if (!["coding", "mixed"].includes(useCase)) {
    const savings = r2(spend);
    return {
      currentPlan: plans[plan]?.name ?? plan,
      recommendedPlan: "Cancel / Switch",
      recommendedTool: "Claude Pro",
      recommendedSpend: r2(20 * seats),
      monthlySavings: r2(Math.max(0, spend - 20 * seats)),
      annualSavings: annual(Math.max(0, spend - 20 * seats)),
      reasoning: `Cursor is a code-first IDE assistant with no meaningful advantage for ${useCase} workflows. Your team is paying $${spend}/month for a specialized coding tool while your primary use case is ${useCase}. Claude Pro ($20/seat/month) or ChatGPT Plus ($20/seat/month) deliver equivalent or superior value for non-coding work at the same or lower total cost.`,
      severity: severityFromSavings(Math.max(0, spend - 20 * seats)),
      actionType: "switch",
    };
  }

  // Enterprise overkill for small teams
  if (plan === "enterprise" && teamSize < 20) {
    const businessCost = r2(plans.business.pricePerSeat * seats);
    const savings = r2(spend - businessCost);
    return {
      currentPlan: plans.enterprise.name,
      recommendedPlan: "Cursor Business",
      recommendedSpend: businessCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Cursor Enterprise (~$80/seat/month) is engineered for organizations with 20+ developers requiring on-premise deployment, SOC 2 compliance workflows, and dedicated support SLAs. With ${teamSize} team members, Cursor Business ($40/seat/month) provides identical AI capabilities, privacy mode, and admin controls at half the cost — a savings of $${Math.max(0, savings)}/month with zero productivity impact.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  // Business plan for 1-2 users — Pro is sufficient
  if (plan === "business" && seats <= 2) {
    const proCost = r2(plans.pro.pricePerSeat * seats);
    const savings = r2(spend - proCost);
    return {
      currentPlan: plans.business.name,
      recommendedPlan: "Cursor Pro",
      recommendedSpend: proCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Cursor Business ($40/seat/month) adds centralized billing, team admin controls, and SAML SSO — features that become valuable at 5+ users. With only ${seats} active seat(s), these administrative features provide no practical benefit. Cursor Pro ($20/seat/month) delivers the same AI completion quality, context windows, and model access. Downgrading saves $${Math.max(0, savings)}/month ($${annual(Math.max(0, savings))}/year) with no capability loss.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  // Cursor + other coding tool detected (cross-tool check happens in main fn)

  return {
    currentPlan: plans[plan]?.name ?? plan,
    recommendedPlan: plans[plan]?.name ?? plan,
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `Your Cursor ${plans[plan]?.name ?? plan} subscription at ${seats} seat(s) is appropriately sized for a ${teamSize}-person coding team. No changes recommended.`,
    severity: "optimal",
    actionType: "none",
  };
}

function auditGithubCopilot(
  plan: string,
  spend: number,
  seats: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const plans = TOOL_CONFIGS.github_copilot.plans;

  if (!["coding", "mixed"].includes(useCase)) {
    const savings = r2(spend);
    return {
      currentPlan: plans[plan]?.name ?? plan,
      recommendedPlan: "Cancel",
      recommendedTool: "Claude Pro or ChatGPT Plus",
      recommendedSpend: 0,
      monthlySavings: savings,
      annualSavings: annual(savings),
      reasoning: `GitHub Copilot is exclusively an in-editor code completion tool. Your team's stated primary use case is ${useCase}, where Copilot provides no value whatsoever — it cannot write documents, conduct research, or assist with data analysis. You are paying $${spend}/month for a specialized coding tool your team doesn't use for its primary work. Cancel and redirect budget to a general-purpose AI tool.`,
      severity: severityFromSavings(savings),
      actionType: "switch",
    };
  }

  if (plan === "enterprise" && teamSize < 25) {
    const businessCost = r2(plans.business.pricePerSeat * seats);
    const savings = r2(spend - businessCost);
    return {
      currentPlan: plans.enterprise.name,
      recommendedPlan: "GitHub Copilot Business",
      recommendedSpend: businessCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `GitHub Copilot Enterprise ($39/seat/month) adds Copilot Chat in GitHub.com, fine-tuned models from your codebase, and knowledge bases — features that require significant GitHub organization infrastructure to leverage and are most valuable for teams of 25+. Copilot Business ($19/seat/month) provides the same in-editor completions, chat in IDE, and pull request summaries your team actually uses daily. Switching saves $${Math.max(0, savings)}/month ($${annual(Math.max(0, savings))}/year) across ${seats} seat(s).`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  return {
    currentPlan: plans[plan]?.name ?? plan,
    recommendedPlan: plans[plan]?.name ?? plan,
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `GitHub Copilot ${plans[plan]?.name ?? plan} is correctly sized for your ${seats}-seat coding team.`,
    severity: "optimal",
    actionType: "none",
  };
}

function auditClaude(
  plan: string,
  spend: number,
  seats: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const plans = TOOL_CONFIGS.claude.plans;

  // Max plan — heavy usage justification check
  if ((plan === "max" || plan === "max_20x") && seats <= 2) {
    const proCost = r2(plans.pro.pricePerSeat * seats);
    const savings = r2(spend - proCost);
    return {
      currentPlan: plans[plan].name,
      recommendedPlan: "Claude Pro",
      recommendedSpend: proCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Claude Max ($${plans[plan as "max"].pricePerSeat}/seat/month) is designed for power users who consistently hit Claude Pro's daily usage limits. For ${seats} user(s), this represents a ${Math.round((plans[plan as "max"].pricePerSeat / plans.pro.pricePerSeat - 1) * 100)}% price premium over Pro. Unless you're regularly exhausting Pro's limits (verified through usage dashboard), downgrading to Claude Pro ($20/seat/month) saves $${Math.max(0, savings)}/month with no practical capability loss for standard workflows.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  // Team plan minimum seat waste
  if (plan === "team" && seats < 5) {
    const minCost = r2(plans.team.pricePerSeat * 5); // 5-seat minimum
    const proAlternativeCost = r2(plans.pro.pricePerSeat * seats);
    const savings = r2(spend - proAlternativeCost);
    return {
      currentPlan: plans.team.name,
      recommendedPlan: "Claude Pro (individual)",
      recommendedSpend: proAlternativeCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Claude Team has a 5-seat minimum ($30/seat/month). With only ${seats} active user(s), you are paying for ${5 - seats} unused seat(s) — pure waste. Individual Claude Pro accounts ($20/seat/month, no minimum) provide identical AI capabilities including Projects and extended context. Switching ${seats} user(s) to individual Pro saves $${Math.max(0, savings)}/month and eliminates the minimum seat commitment.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  // Enterprise for tiny teams
  if (plan === "enterprise" && teamSize < 15) {
    const teamCost = r2(Math.max(5, seats) * plans.team.pricePerSeat);
    const savings = r2(spend - teamCost);
    return {
      currentPlan: plans.enterprise.name,
      recommendedPlan: "Claude Team",
      recommendedSpend: teamCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Claude Enterprise ($60/seat/month estimated) provides dedicated deployment, custom data retention policies, SAML SSO, and priority support — an infrastructure investment appropriate for organizations with 15+ employees and compliance requirements. At ${teamSize} people, Claude Team ($30/seat/month) provides admin console, team usage dashboard, and collaborative Projects with no practical capability gaps. Potential savings: $${Math.max(0, savings)}/month.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  return {
    currentPlan: plans[plan]?.name ?? plan,
    recommendedPlan: plans[plan]?.name ?? plan,
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `Claude ${plans[plan]?.name ?? plan} is well-matched to your team of ${teamSize} for ${useCase} work.`,
    severity: "optimal",
    actionType: "none",
  };
}

function auditChatGPT(
  plan: string,
  spend: number,
  seats: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const plans = TOOL_CONFIGS.chatgpt.plans;

  if (plan === "team" && seats < 2) {
    const plusCost = r2(plans.plus.pricePerSeat * seats);
    const savings = r2(spend - plusCost);
    return {
      currentPlan: plans.team.name,
      recommendedPlan: "ChatGPT Plus",
      recommendedSpend: plusCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `ChatGPT Team requires a minimum of 2 seats ($30/seat/month) and adds a shared workspace and admin panel. With only ${seats} active user(s), the team workspace features are unused overhead. ChatGPT Plus ($20/month) provides identical model access (GPT-4o), usage limits, and capabilities for a single user. Downgrading saves $${Math.max(0, savings)}/month with zero functional impact.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  if (plan === "enterprise" && teamSize < 20) {
    const teamCost = r2(Math.max(2, seats) * plans.team.pricePerSeat);
    const savings = r2(spend - teamCost);
    return {
      currentPlan: plans.enterprise.name,
      recommendedPlan: "ChatGPT Team",
      recommendedSpend: teamCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `ChatGPT Enterprise (~$60/seat/month) provides SSO, advanced security controls, dedicated infrastructure, and compliance tooling built for organizations with 20+ employees and enterprise procurement requirements. At ${teamSize} people, ChatGPT Team ($30/seat/month) delivers shared workspaces, admin dashboard, and the same GPT-4o model without the enterprise overhead. Switching saves $${Math.max(0, savings)}/month ($${annual(Math.max(0, savings))}/year).`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  // Coding use case → suggest Cursor as better fit
  if (plan === "plus" && useCase === "coding" && seats >= 3) {
    const cursorCost = r2(20 * seats); // Cursor Pro
    const delta = r2(spend - cursorCost);
    if (Math.abs(delta) < 5) {
      // Same price, different tool — flag as switch suggestion
      return {
        currentPlan: plans.plus.name,
        recommendedPlan: "Consider Cursor Pro",
        recommendedTool: "Cursor",
        recommendedSpend: cursorCost,
        monthlySavings: 0,
        annualSavings: 0,
        reasoning: `For a team of ${seats} developers primarily doing coding, Cursor Pro ($20/seat/month) offers significantly better IDE integration, in-editor multi-file context, and code-specific completions compared to ChatGPT Plus. Both are $20/seat/month — this is a zero-cost upgrade in developer experience, not a savings opportunity per se, but worth evaluating.`,
        severity: "minor",
        actionType: "switch",
      };
    }
  }

  return {
    currentPlan: plans[plan]?.name ?? plan,
    recommendedPlan: plans[plan]?.name ?? plan,
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `ChatGPT ${plans[plan]?.name ?? plan} is correctly provisioned for your team.`,
    severity: "optimal",
    actionType: "none",
  };
}

function auditApiTool(
  tool: string,
  spend: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const isAnthropic = tool === "anthropic_api";
  const seatTool = isAnthropic ? "claude" : "chatgpt";
  const seatPlan = isAnthropic ? "team" : "team";
  const seatPrice = isAnthropic ? 30 : 30;
  const seatLabel = isAnthropic ? "Claude Team" : "ChatGPT Team";
  const minSeats = isAnthropic ? 5 : 2;

  // High spend relative to seat plan equivalent
  if (spend > 500 && teamSize >= minSeats) {
    const seatCost = r2(seatPrice * Math.max(minSeats, teamSize));
    const savings = r2(spend - seatCost);
    if (savings > 50) {
      return {
        currentPlan: "Pay-as-you-go",
        recommendedPlan: `${seatLabel} (seat-based)`,
        recommendedSpend: seatCost,
        monthlySavings: savings,
        annualSavings: annual(savings),
        reasoning: `At $${spend}/month in API spend across a ${teamSize}-person team, you're paying $${r2(spend / teamSize)}/person/month for raw API access. ${seatLabel} ($${seatPrice}/seat/month) provides unlimited conversational usage per seat, admin controls, data privacy commitments, and team collaboration features. The break-even is $${seatPrice}/person/month in API consumption — above that, a seat plan is cheaper and more predictable. Switching could save $${savings}/month ($${annual(savings)}/year).`,
        severity: severityFromSavings(savings),
        actionType: "optimize_api",
      };
    }
  }

  // Low spend — API is the right model
  if (spend < 50) {
    return {
      currentPlan: "Pay-as-you-go",
      recommendedPlan: "Pay-as-you-go",
      recommendedSpend: spend,
      monthlySavings: 0,
      annualSavings: 0,
      reasoning: `At $${spend}/month, pay-per-token API access is the correct billing model. A seat-based subscription plan starts at $${seatPrice * minSeats}/month minimum — your current usage doesn't justify the fixed cost. Continue on API billing and revisit when spend exceeds $${seatPrice * minSeats}/month.`,
      severity: "optimal",
      actionType: "none",
    };
  }

  return {
    currentPlan: "Pay-as-you-go",
    recommendedPlan: "Pay-as-you-go",
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `API spend of $${spend}/month is in a zone where pay-per-token billing remains efficient for your team size. Monitor monthly — if spend exceeds $${seatPrice * Math.max(minSeats, teamSize)}/month, a seat plan becomes the more cost-effective option.`,
    severity: "optimal",
    actionType: "none",
  };
}

function auditGemini(
  plan: string,
  spend: number,
  seats: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const plans = TOOL_CONFIGS.gemini.plans;

  // Coding teams on Gemini → better options available
  if (useCase === "coding" && plan !== "api") {
    const cursorCost = r2(20 * seats);
    const savings = r2(spend - cursorCost);
    return {
      currentPlan: plans[plan]?.name ?? plan,
      recommendedPlan: "Switch to Cursor Pro",
      recommendedTool: "Cursor",
      recommendedSpend: cursorCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Gemini's strengths lie in document processing, multimodal reasoning, and Google Workspace integration — not code completion. For a coding-primary team, purpose-built coding assistants (Cursor Pro at $20/seat/month or GitHub Copilot Business at $19/seat/month) provide dramatically better in-editor completions, codebase awareness, and language-specific intelligence. You'd get more coding productivity value at $${Math.max(0, savings)}/month less.`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "switch",
    };
  }

  // Consumer Advanced plan used for business purposes
  if (plan === "advanced" && seats > 1) {
    const businessCost = r2(plans.workspace_business.pricePerSeat * seats);
    const savings = r2(spend - businessCost);
    return {
      currentPlan: plans.advanced.name,
      recommendedPlan: "Gemini for Workspace Business",
      recommendedSpend: businessCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Gemini Advanced (Google One AI Premium, $19.99/month) is a consumer product without business data protections, admin controls, or compliance guarantees. For a business team, Gemini for Google Workspace Business ($20/seat/month) provides the same model capabilities with enterprise data handling, admin console, and data privacy commitments required for professional use. The price difference is minimal ($${Math.abs(r2(spend - businessCost))}/month), but the compliance posture improvement is significant.`,
      severity: "minor",
      actionType: "switch",
    };
  }

  return {
    currentPlan: plans[plan]?.name ?? plan,
    recommendedPlan: plans[plan]?.name ?? plan,
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `Gemini ${plans[plan]?.name ?? plan} is appropriately configured for your ${useCase} workflow.`,
    severity: "optimal",
    actionType: "none",
  };
}

function auditWindsurf(
  plan: string,
  spend: number,
  seats: number,
  teamSize: number,
  useCase: string
): Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend"> {
  const plans = TOOL_CONFIGS.windsurf.plans;

  if (!["coding", "mixed"].includes(useCase)) {
    return {
      currentPlan: plans[plan]?.name ?? plan,
      recommendedPlan: "Cancel / Switch",
      recommendedTool: "Claude Pro",
      recommendedSpend: r2(20 * seats),
      monthlySavings: Math.max(0, r2(spend - 20 * seats)),
      annualSavings: annual(Math.max(0, r2(spend - 20 * seats))),
      reasoning: `Windsurf is a code-first AI IDE. Your team's primary use case is ${useCase}, where a general-purpose AI assistant provides substantially more value. Consider Claude Pro or ChatGPT Plus at $20/seat/month for your workflow.`,
      severity: severityFromSavings(Math.max(0, r2(spend - 20 * seats))),
      actionType: "switch",
    };
  }

  if (plan === "teams" && seats < 5) {
    const proCost = r2(plans.pro.pricePerSeat * seats);
    const savings = r2(spend - proCost);
    return {
      currentPlan: plans.teams.name,
      recommendedPlan: "Windsurf Pro",
      recommendedSpend: proCost,
      monthlySavings: Math.max(0, savings),
      annualSavings: annual(Math.max(0, savings)),
      reasoning: `Windsurf Teams ($35/seat/month) adds centralized billing and admin controls — overhead designed for teams of 5+. With ${seats} user(s), individual Windsurf Pro ($15/seat/month) delivers identical AI coding capabilities at less than half the per-seat cost. Downgrading saves $${Math.max(0, savings)}/month ($${annual(Math.max(0, savings))}/year).`,
      severity: severityFromSavings(Math.max(0, savings)),
      actionType: "downgrade",
    };
  }

  return {
    currentPlan: plans[plan]?.name ?? plan,
    recommendedPlan: plans[plan]?.name ?? plan,
    recommendedSpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `Windsurf ${plans[plan]?.name ?? plan} is well-matched to your coding team.`,
    severity: "optimal",
    actionType: "none",
  };
}

// ─── cross-tool overlap analysis ──────────────────────────────────────────────

interface OverlapResult {
  extraSavings: number;
  overlapNote?: string;
}

function detectOverlaps(tools: AuditInput["tools"], useCase: string): OverlapResult {
  const toolNames = tools.map((t) => t.tool);

  // Multiple IDE-based coding assistants simultaneously
  const ideCodingTools = toolNames.filter((t) =>
    ["cursor", "github_copilot", "windsurf"].includes(t)
  );

  if (ideCodingTools.length >= 2) {
    // The cheapest of the set is probably redundant
    const redundantTools = tools
      .filter((t) => ideCodingTools.includes(t.tool))
      .sort((a, b) => a.monthlySpend - b.monthlySpend);

    const redundantSpend = redundantTools
      .slice(0, redundantTools.length - 1) // keep the most expensive (probably the preferred one)
      .reduce((sum, t) => sum + t.monthlySpend, 0);

    if (redundantSpend > 0) {
      return {
        extraSavings: redundantSpend,
        overlapNote: `Overlap detected: You are paying for ${ideCodingTools.length} simultaneous IDE coding assistants (${ideCodingTools.map((t) => TOOL_CONFIGS[t].displayName).join(", ")}). Developers can only actively use one coding assistant at a time. The redundant subscription(s) represent $${redundantSpend}/month in direct waste — cancel all but the team's preferred tool.`,
      };
    }
  }

  // Claude + ChatGPT both at seat level — significant overlap
  if (toolNames.includes("claude") && toolNames.includes("chatgpt")) {
    const claudeEntry = tools.find((t) => t.tool === "claude");
    const chatgptEntry = tools.find((t) => t.tool === "chatgpt");
    if (claudeEntry && chatgptEntry && claudeEntry.seats > 0 && chatgptEntry.seats > 0) {
      const smallerSpend = Math.min(
        claudeEntry.monthlySpend,
        chatgptEntry.monthlySpend
      );
      return {
        extraSavings: 0, // handled per-tool, but flag the overlap
        overlapNote: `Overlap detected: Your team pays for both Claude and ChatGPT seat subscriptions with overlapping functionality. For most use cases (writing, research, coding assistance), one general-purpose AI is sufficient. Evaluate which model your team actually prefers and consolidate — eliminating the less-used subscription could save up to $${smallerSpend}/month.`,
      };
    }
  }

  return { extraSavings: 0 };
}

// ─── main audit function ──────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;
  const recommendations: ToolRecommendation[] = [];

  for (const entry of tools) {
    const ctx = {
      plan: entry.plan,
      spend: entry.monthlySpend,
      seats: entry.seats,
      teamSize,
      useCase,
    };

    let rec: Omit<ToolRecommendation, "toolId" | "toolName" | "currentSpend">;

    switch (entry.tool) {
      case "cursor":
        rec = auditCursor(ctx.plan, ctx.spend, ctx.seats, ctx.teamSize, ctx.useCase);
        break;
      case "github_copilot":
        rec = auditGithubCopilot(ctx.plan, ctx.spend, ctx.seats, ctx.teamSize, ctx.useCase);
        break;
      case "claude":
        rec = auditClaude(ctx.plan, ctx.spend, ctx.seats, ctx.teamSize, ctx.useCase);
        break;
      case "chatgpt":
        rec = auditChatGPT(ctx.plan, ctx.spend, ctx.seats, ctx.teamSize, ctx.useCase);
        break;
      case "openai_api":
      case "anthropic_api":
        rec = auditApiTool(entry.tool, ctx.spend, ctx.teamSize, ctx.useCase);
        break;
      case "gemini":
        rec = auditGemini(ctx.plan, ctx.spend, ctx.seats, ctx.teamSize, ctx.useCase);
        break;
      case "windsurf":
        rec = auditWindsurf(ctx.plan, ctx.spend, ctx.seats, ctx.teamSize, ctx.useCase);
        break;
      default:
        rec = {
          currentPlan: entry.plan,
          recommendedPlan: entry.plan,
          recommendedSpend: entry.monthlySpend,
          monthlySavings: 0,
          annualSavings: 0,
          reasoning: "No specific optimization rules found for this tool.",
          severity: "optimal",
          actionType: "none",
        };
    }

    recommendations.push({
      toolId: entry.id,
      toolName: getDisplayName(entry.tool),
      currentSpend: entry.monthlySpend,
      ...rec,
    });
  }

  // Cross-tool overlap analysis
  const { extraSavings, overlapNote } = detectOverlaps(tools, useCase);

  const totalMonthlySpend = r2(tools.reduce((s, t) => s + t.monthlySpend, 0));
  const perToolSavings = r2(recommendations.reduce((s, r) => s + r.monthlySavings, 0));
  const totalMonthlySavings = r2(perToolSavings + extraSavings);
  const totalAnnualSavings = annual(totalMonthlySavings);
  const optimizedMonthlySpend = r2(Math.max(0, totalMonthlySpend - totalMonthlySavings));
  const savingsPercentage =
    totalMonthlySpend > 0 ? r2((totalMonthlySavings / totalMonthlySpend) * 100) : 0;

  // Append overlap note to the highest-savings recommendation if relevant
  if (overlapNote) {
    const topRec = recommendations
      .filter((r) => r.monthlySavings > 0)
      .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
    if (topRec) {
      topRec.reasoning += `\n\n⚠️ ${overlapNote}`;
    }
  }

  return {
    id: uuidv4(),
    input,
    recommendations,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    optimizedMonthlySpend,
    savingsPercentage,
    createdAt: new Date().toISOString(),
  };
}

export { detectOverlaps };
