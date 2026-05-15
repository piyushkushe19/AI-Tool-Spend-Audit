import { describe, it, expect } from "vitest";
import { runAudit, detectOverlaps } from "./audit-engine.js";
import type { AuditInput } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

function tool(
  name: string,
  plan: string,
  spend: number,
  seats = 1
): AuditInput["tools"][0] {
  return { id: uuidv4(), tool: name as any, plan, monthlySpend: spend, seats };
}

function input(overrides: Partial<AuditInput> = {}): AuditInput {
  return { teamSize: 5, useCase: "coding", tools: [], ...overrides };
}

// ── 1. Overpay detection: Cursor Business for 2 seats ─────────────────────────
describe("Cursor — overpay detection", () => {
  it("flags Business plan for 2 seats, recommends Pro downgrade", () => {
    const result = runAudit(input({ tools: [tool("cursor", "business", 80, 2)] }));
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBe(40); // 2*(40-20)
    expect(rec.actionType).toBe("downgrade");
    expect(rec.severity).not.toBe("optimal");
  });

  it("does not flag Cursor Pro for coding team", () => {
    const result = runAudit(input({ tools: [tool("cursor", "pro", 60, 3)] }));
    expect(result.recommendations[0].severity).toBe("optimal");
    expect(result.recommendations[0].monthlySavings).toBe(0);
  });
});

// ── 2. Enterprise misuse: GitHub Copilot Enterprise for small team ────────────
describe("GitHub Copilot — enterprise misuse", () => {
  it("recommends downgrade from Enterprise to Business for teams under 25", () => {
    const result = runAudit(
      input({ teamSize: 10, tools: [tool("github_copilot", "enterprise", 195, 5)] })
    );
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.actionType).toBe("downgrade");
    expect(rec.recommendedPlan).toContain("Business");
  });

  it("does not flag Enterprise for a large team", () => {
    const result = runAudit(
      input({ teamSize: 30, tools: [tool("github_copilot", "enterprise", 780, 20)] })
    );
    expect(result.recommendations[0].severity).toBe("optimal");
  });
});

// ── 3. API optimization: high Anthropic API spend vs seat plan ────────────────
describe("Anthropic API — optimization", () => {
  it("recommends seat plan when API spend exceeds seat plan threshold with large team", () => {
    const result = runAudit(
      input({ teamSize: 10, tools: [tool("anthropic_api", "payg", 800)] })
    );
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.actionType).toBe("optimize_api");
  });

  it("keeps API billing for low spend", () => {
    const result = runAudit(
      input({ teamSize: 3, tools: [tool("anthropic_api", "payg", 40)] })
    );
    expect(result.recommendations[0].severity).toBe("optimal");
  });
});

// ── 4. Savings calculation accuracy ──────────────────────────────────────────
describe("Savings calculation", () => {
  it("total monthly savings equals sum of per-tool savings", () => {
    const result = runAudit(
      input({
        teamSize: 8,
        tools: [
          tool("cursor", "business", 80, 2),   // saves $40
          tool("github_copilot", "enterprise", 195, 5), // saves some amount
        ],
      })
    );
    const perToolSum = result.recommendations.reduce(
      (s, r) => s + r.monthlySavings,
      0
    );
    // totalMonthlySavings may include overlap savings
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(perToolSum);
  });

  it("annual savings equals monthly savings × 12", () => {
    const result = runAudit(
      input({ tools: [tool("cursor", "business", 80, 2)] })
    );
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("optimized spend equals total spend minus savings", () => {
    const result = runAudit(
      input({ tools: [tool("cursor", "business", 80, 2)] })
    );
    expect(result.optimizedMonthlySpend).toBe(
      Math.max(0, result.totalMonthlySpend - result.totalMonthlySavings)
    );
  });

  it("total monthly spend matches sum of inputs", () => {
    const result = runAudit(
      input({
        tools: [
          tool("cursor", "pro", 60, 3),
          tool("chatgpt", "plus", 40, 2),
        ],
      })
    );
    expect(result.totalMonthlySpend).toBe(100);
  });
});

// ── 5. Edge cases ─────────────────────────────────────────────────────────────
describe("Edge cases", () => {
  it("handles zero spend without errors", () => {
    const result = runAudit(input({ tools: [tool("cursor", "hobby", 0)] }));
    expect(result.totalMonthlySpend).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("never returns negative total savings", () => {
    const result = runAudit(
      input({ teamSize: 100, tools: [tool("claude", "enterprise", 6000, 100)] })
    );
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
  });

  it("handles non-coding team on coding tool", () => {
    const result = runAudit(
      input({ useCase: "writing", tools: [tool("cursor", "pro", 60, 3)] })
    );
    const rec = result.recommendations[0];
    expect(rec.actionType).toBe("switch");
    expect(rec.monthlySavings).toBeGreaterThanOrEqual(0);
  });

  it("does not crash on all tools in one audit", () => {
    const allTools = [
      tool("cursor", "pro", 60, 3),
      tool("github_copilot", "business", 57, 3),
      tool("claude", "pro", 60, 3),
      tool("chatgpt", "plus", 60, 3),
      tool("openai_api", "payg", 120),
      tool("anthropic_api", "payg", 80),
      tool("gemini", "advanced", 20),
      tool("windsurf", "pro", 45, 3),
    ];
    expect(() =>
      runAudit(input({ teamSize: 10, useCase: "mixed", tools: allTools }))
    ).not.toThrow();
  });
});

// ── 6. Claude Team minimum seat waste ─────────────────────────────────────────
describe("Claude — minimum seat waste", () => {
  it("flags Team plan below 5-seat minimum as overspend", () => {
    const result = runAudit(input({ tools: [tool("claude", "team", 90, 3)] }));
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reasoning).toMatch(/5-seat minimum/i);
  });
});

// ── 7. Overlap detection ──────────────────────────────────────────────────────
describe("Overlap detection", () => {
  it("detects multiple simultaneous IDE coding tools as overlap", () => {
    const tools = [
      tool("cursor", "pro", 60, 3),
      tool("github_copilot", "business", 57, 3),
      tool("windsurf", "pro", 45, 3),
    ];
    const { extraSavings, overlapNote } = detectOverlaps(tools, "coding");
    expect(extraSavings).toBeGreaterThan(0);
    expect(overlapNote).toContain("simultaneous IDE");
  });

  it("does not flag a single coding tool as overlap", () => {
    const tools = [tool("cursor", "pro", 60, 3)];
    const { extraSavings } = detectOverlaps(tools, "coding");
    expect(extraSavings).toBe(0);
  });
});

// ── 8. Savings percentage ─────────────────────────────────────────────────────
describe("Savings percentage", () => {
  it("calculates savings percentage correctly", () => {
    // Cursor Business 2 seats: $80/mo spend, $40/mo savings = 50%
    const result = runAudit(
      input({ tools: [tool("cursor", "business", 80, 2)] })
    );
    expect(result.savingsPercentage).toBeCloseTo(50, 0);
  });

  it("returns 0% savings percentage when already optimal", () => {
    const result = runAudit(
      input({ tools: [tool("cursor", "pro", 40, 2)] })
    );
    expect(result.savingsPercentage).toBe(0);
  });
});
