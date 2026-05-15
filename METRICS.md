# Metrics — SpendLens

---

## North Star Metric

**Qualified leads generated per week**

Defined as: email captures where identified monthly savings > $200.

**Why this and not total audits or DAU:**

SpendLens is a B2B lead generation asset for Credex, not a consumer product. Volume metrics (DAU, total audits, page views) are vanity at this stage. A team spending $50/month on AI with no savings to unlock is not a Credex customer. A team spending $600/month with $400/month in identifiable savings is. The North Star filters for signal over noise.

DAU is explicitly wrong here: the average user runs one audit every 6-12 months as their team size changes. Optimising for DAU would push toward gamification or irrelevant "return to check for new savings" prompts that don't serve users.

---

## 3 Input Metrics

### 1. Audit completion rate (form start → results page)

**Target:** ≥ 40%

**Why it matters:** This is the primary funnel bottleneck. Form abandonment on the "seats" field (Day 5 discovery from user interview) was a specific friction point. If completion rate drops below 30%, investigate form UX before anything else.

**How to instrument:** Fire `audit_started` on first form field interaction. Fire `audit_completed` on results page mount. Rate = `completed / started`.

### 2. Email capture rate (results viewed → email submitted)

**Target:** ≥ 30%

**Why it matters:** This is the value exchange. We show the audit result, then ask for email. If fewer than 30% are converting, either: (a) the savings numbers are too low to motivate action, (b) the email form is too prominent and feels premature, or (c) the audit quality isn't credible enough to justify the ask.

**How to instrument:** Fire `results_viewed` on results page mount. Fire `lead_captured` on successful POST /api/leads. Rate = `captured / viewed`.

### 3. Credex CTA click rate (from high-savings audits)

**Target:** ≥ 15% of audits showing > $500/mo savings

**Why it matters:** This is the final step of the conversion funnel. A high-savings audit that doesn't generate a Credex consultation request is a missed opportunity. Low rate here indicates the Credex offer isn't resonating — test copy, specificity of offer, and placement.

**How to instrument:** Fire `credex_cta_clicked` on Credex link click. Denominator is all results page views where `totalMonthlySavings > 500`.

---

## What to instrument first (ordered by priority)

1. `audit_started` — first form field touched
2. `audit_completed` — results page mounted with audit data
3. `lead_captured` — POST /api/leads succeeded
4. `credex_cta_clicked` — Credex link clicked from results page
5. `audit_shared` — share URL copied
6. Form abandonment field — which field causes drop-off (tool, plan, spend, seats)
7. Return visits — users who run a second audit (expected to be low; useful as engagement signal)

**Tooling:** PostHog (free tier) covers all of the above. Set up in Week 1 of launch.

---

## Pivot trigger

**After 500 audit completions:**

If email capture rate < 15% AND Credex CTA click rate < 5% on high-savings audits, the tool is not generating qualified leads.

**Diagnose in this order:**

1. **Wrong audience:** Are the audits showing low savings on average? If the median identified savings is < $50, the tool is reaching already-optimised teams or teams too small to have meaningful AI spend. Fix: adjust distribution channels toward larger teams.

2. **Wrong product:** Are savings numbers credible to users? Check if users who see $200+/mo savings still don't click Credex CTA. If so, the Credex offer or placement is the problem, not the audit.

3. **Wrong market timing:** If overall AI tool spending is contracting (tools getting cheaper), the audit finds less. Pivot to benchmark mode or team productivity comparison rather than pure cost savings.

**What NOT to pivot on:** Low total audit volume in Week 1. 50 audits in Week 1 is fine — distribution takes time. Only pivot on conversion rates, not on volume.
