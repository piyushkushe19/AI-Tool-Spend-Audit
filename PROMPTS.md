# Prompts — SpendLens

## Where AI is and isn't used

**NOT used for:** Audit calculations, savings amounts, plan recommendations, reasoning strings. These are 100% deterministic TypeScript rules. Financial reasoning must be reproducible and testable.

**Used for:** The ~100-word personalised summary paragraph on the results page. Synthesis and tone — tasks where language model creativity adds value over a template.

---

## The summary prompt

**Location:** `server/src/lib/anthropic.ts`
**Model:** `claude-opus-4-5`
**Max tokens:** 200

```
You are a CFO-level financial advisor writing a concise, credible AI spend audit summary for a startup.

Audit data:
- Team size: {teamSize} people
- Primary use case: {useCase}
- Current total AI spend: ${totalMonthlySpend}/month
- Identified savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)
- Savings as % of spend: {savingsPercentage}%
- Tool breakdown: {toolBreakdown}

Write an 80-110 word summary paragraph that:
1. Opens with a specific, non-generic observation about their spending pattern
2. Names the 1-2 largest concrete savings opportunities with exact dollar figures
3. Provides one clear next-step action
4. Closes with what this means in annual terms

Tone rules:
- Write like a CFO who has reviewed hundreds of software spend reports
- Be direct. No "great news!", no motivational fluff, no generic openers
- Cite specific dollar amounts and percentages
- One paragraph only. No lists. No headers.
```

**Why it's written this way:**

The most important constraint is tone. Without "no 'great news!'" and "no motivational fluff", every test run produced some variant of "Great news! We found amazing savings for you!" — language that destroys credibility for a financial tool. Explicitly prohibiting these phrases was the single most effective prompt improvement.

The word count range (80–110 words) prevents rambling without being too tight. Under 80 words feels terse; over 110 drifts toward blog post territory.

The requirement to name 1-2 opportunities with exact dollar figures prevents vague summaries. Without it, the model produces "you have multiple optimization opportunities" (useless). With it, you get "your Cursor Business plan at $80/month for two developers is your largest single waste item — switching to Pro saves $40/month immediately."

The `toolBreakdown` context is condensed to one line per tool: `{toolName} ({plan}): $X/mo, savings $Y/mo via {actionType}`. Passing the full recommendations JSON caused the model to enumerate every tool rather than synthesise.

---

## Prompt iterations that didn't work

**Attempt 1 — No system framing, just data:**
```
Here is an AI spend audit result: [JSON]. Write a 100-word summary.
```
Result: The model treated it as a product description task and wrote marketing copy ("This comprehensive AI spend audit reveals exciting optimization opportunities..."). Useless.

**Attempt 2 — "Expert financial advisor" framing:**
Result: Better tone, but still included "I'm pleased to report" and "I'm excited to share." The model's politeness defaults persisted.

**Attempt 3 — "CFO who has reviewed hundreds of reports" framing + explicit prohibitions:**
Result: Correct tone on first run. Specific, direct, no filler language. This is the current prompt.

**Attempt 4 — Bullet point output:**
```
...Write a 3-bullet summary with specific actions.
```
Result: Duplicated the per-tool recommendation cards already shown in the UI. No value over the existing breakdown. Reverted to prose.

**Attempt 5 — claude-sonnet-4-5 instead of claude-opus-4-5:**
Result: Noticeably worse on tone-sensitive tasks. The CFO framing held, but phrasing was less sharp. Given that this is called once per audit completion (not per page view), the cost difference between Sonnet and Opus is acceptable. Using Opus.

---

## Fallback summary

If the Anthropic API call fails (network error, rate limit, key missing), the code falls back to a template-generated summary:

```typescript
function buildFallbackSummary(audit: AuditResult): string {
  if (audit.totalMonthlySavings < 100) {
    return `Your ${teamSize}-person team is spending $${totalMonthlySpend}/month on AI tools 
    and appears well-optimised...`
  }
  // ... uses topRec to name the biggest opportunity
}
```

The fallback is deterministic and always produces a grammatically correct paragraph. It lacks the CFO tone of the AI version but is never empty, broken, or hallucinated.

The results page renders immediately regardless of AI availability.
