# Tests — SpendLens

All tests are in `server/src/lib/audit-engine.test.ts` and run with Vitest.

## How to run

```bash
cd server
npm test          # run once
npm run test:watch   # watch mode
```

All tests are pure unit tests against the audit engine — no database, no API calls, no network. Each test constructs a minimal `AuditInput`, calls `runAudit()`, and asserts on the structured output.

---

## Test inventory

### Suite 1: Cursor — overpay detection

**Test:** `"flags Business plan for 2 seats, recommends Pro downgrade"`
Constructs a Cursor Business 2-seat input at $80/mo. Asserts `monthlySavings === 40` (2 × $20 delta), `actionType === "downgrade"`, and severity is not "optimal".
**Guards against:** False-positive-free downgrade recommendations.

**Test:** `"does not flag Cursor Pro for coding team"`
Constructs Cursor Pro 3 seats. Asserts `severity === "optimal"` and `monthlySavings === 0`.
**Guards against:** Incorrectly recommending downgrades on already-correct plans.

---

### Suite 2: GitHub Copilot — enterprise misuse

**Test:** `"recommends downgrade from Enterprise to Business for teams under 25"`
10-person team on GitHub Copilot Enterprise (5 seats, $195/mo). Asserts `monthlySavings > 0`, `actionType === "downgrade"`, recommendation contains "Business".
**Guards against:** Missing the most common enterprise overkill pattern.

**Test:** `"does not flag Enterprise for a large team"`
30-person team on Copilot Enterprise. Asserts `severity === "optimal"`.
**Guards against:** False positives for legitimately-sized enterprise plans.

---

### Suite 3: Anthropic API — optimization

**Test:** `"recommends seat plan when API spend exceeds seat plan threshold with large team"`
10-person team, Anthropic API at $800/mo. Asserts `monthlySavings > 0`, `actionType === "optimize_api"`.
**Guards against:** Missing the most impactful API → seat plan optimization for growing teams.

**Test:** `"keeps API billing for low spend"`
3-person team, Anthropic API at $40/mo. Asserts `severity === "optimal"` (API is correct billing model at this spend level).
**Guards against:** Incorrectly pushing users to seat plans they don't need.

---

### Suite 4: Savings calculation accuracy

**Test:** `"total monthly savings equals sum of per-tool savings"`
Two-tool input (Cursor Business 2 seats + GitHub Copilot Enterprise 5 seats). Asserts `totalMonthlySavings ≥ perToolSum` (may include overlap savings).

**Test:** `"annual savings equals monthly savings × 12"`
Single tool input. Asserts `totalAnnualSavings === totalMonthlySavings * 12`.

**Test:** `"optimized spend equals total spend minus savings"`
Asserts `optimizedMonthlySpend === Math.max(0, totalMonthlySpend - totalMonthlySavings)`.

**Test:** `"total monthly spend matches sum of inputs"`
Two tools: Cursor Pro $60 + ChatGPT Plus $40. Asserts `totalMonthlySpend === 100`.

---

### Suite 5: Edge cases

**Test:** `"handles zero spend without errors"`
Cursor Hobby at $0. Asserts `totalMonthlySpend === 0`, `totalMonthlySavings === 0`.

**Test:** `"never returns negative total savings"`
Large Claude Enterprise configuration. Asserts `totalMonthlySavings ≥ 0`.

**Test:** `"handles non-coding team on coding tool"`
Writing use case, Cursor Pro 3 seats. Asserts `actionType === "switch"` (not "downgrade" — wrong use case, not wrong plan size).

**Test:** `"does not crash on all tools in one audit"`
All 8 tools in one input. Asserts no thrown exceptions.

---

### Suite 6: Claude Team — minimum seat waste

**Test:** `"flags Team plan below 5-seat minimum as overspend"`
Claude Team 3 seats. Asserts `monthlySavings > 0` and `reasoning` string contains "5-seat minimum".
**Guards against:** Missing the most common Claude plan waste pattern.

---

### Suite 7: Overlap detection

**Test:** `"detects multiple simultaneous IDE coding tools as overlap"`
Cursor Pro + GitHub Copilot Business + Windsurf Pro simultaneously. Asserts `extraSavings > 0` and `overlapNote` contains "simultaneous IDE".

**Test:** `"does not flag a single coding tool as overlap"`
Cursor Pro only. Asserts `extraSavings === 0`.

---

### Suite 8: Savings percentage

**Test:** `"calculates savings percentage correctly"`
Cursor Business 2 seats: $80/mo spend, $40/mo savings. Asserts `savingsPercentage ≈ 50`.

**Test:** `"returns 0% savings percentage when already optimal"`
Cursor Pro 2 seats. Asserts `savingsPercentage === 0`.
