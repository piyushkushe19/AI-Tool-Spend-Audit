# Reflection — SpendLens

---

## 1. The hardest bug I hit this week

The most frustrating bug was silent form submission failure when using `useFieldArray` from `react-hook-form`.

**Symptom:** Clicking "Run free audit" appeared to do nothing. No network request fired, no console error, no validation message.

**Initial hypotheses (all wrong):**
- The Zod schema was rejecting the data silently
- The form's `onSubmit` handler wasn't being attached
- A re-render was resetting the form before submission

**What I actually tried:**
I added `console.log` inside `handleSubmit`'s callback — it never ran. I added `console.log` on the `<form>` element's `onSubmit` directly — that ran. So `handleSubmit` was receiving the submit event but not calling my callback. I opened the React DevTools and checked the form values at submit time — the `tools` array showed `[undefined, undefined]`.

**Root cause:** `useFieldArray` requires each appended item to have a field registered as part of the schema. I was appending objects with a dynamically-named `id` that wasn't in the Zod schema's `z.object({...})`. Because the field IDs didn't match, `react-hook-form` couldn't construct a valid values object, and `handleSubmit` silently swallowed the validation failure.

**Fix:** Added `id: z.string()` to the `toolSchema` object. Also added `console.error` in the `handleSubmit` error callback — which I'd left empty — so future validation failures surface visibly in development.

**Lesson:** Always handle both the success and error paths of `handleSubmit`. Empty error callbacks are debugging traps.

---

## 2. A decision I reversed mid-week

On Day 1, I designed the audit engine to output a "fit score" (0–100) for each tool relative to the team's use case, then rank recommendations by score delta. It felt elegant — one unified scoring model instead of per-tool rule sets.

I reversed it completely on Day 3.

**Why the score approach failed:**
- A score is opaque. "Cursor: 68/100" tells a user nothing actionable.
- I couldn't write finance-level reasoning from a score. The reasoning needs to cite specific dollars and specific plan features, not a calculated number.
- Testing was harder — assertions on floating-point scores are fragile; assertions on specific savings amounts and action types are clear.
- A score model would have invited AI to "fill in the reasoning," which is exactly what the assignment says not to do for financial logic.

**What replaced it:** Per-tool rule functions, each returning a specific recommendation with dollar amounts. More code to write, but each rule is independently testable, the reasoning is naturally specific, and false positives are easier to catch.

The reversal cost most of Day 3's original plan, but the product quality is substantially better for it. The user interviews on Day 5 confirmed this — users read the reasoning and said it was the most credible part.

---

## 3. What I'd build in Week 2

**Priority 1 — PDF export.** Multiple user interviews mentioned wanting to share a document with their CEO or board. A properly formatted PDF of the audit report with the Credex branding would be a high-value output. I'd use `@react-pdf/renderer` server-side with a clean layout matching the web results page.

**Priority 2 — Benchmark mode.** "Your AI spend per developer is $X — companies your size average $Y." After 500 audits, the aggregated anonymous data from the database would make this meaningful. "We spend more than 78% of similar companies" is a shareable sentence.

**Priority 3 — Form UX improvements.** The "seats" field needs a per-seat cost helper (spend ÷ seats shown inline). The tool dropdown would benefit from a search input at 8+ tools. The form should auto-suggest realistic monthly spend amounts based on the selected plan's listed price × seats, with an override for enterprise/custom pricing.

**Priority 4 — Embeddable widget.** A `<script>` tag that bloggers and newsletters can drop in. The embed shows a mini-form; clicking through opens SpendLens with pre-filled data. High distribution leverage with zero additional infrastructure.

**Priority 5 — Slack/Linear integration.** For engineering managers, posting audit results directly to a Slack channel or creating a Linear issue with the recommendations would make the tool actionable without requiring them to forward an email.

---

## 4. How I used AI tools

**Claude (claude.ai) — heavily used for:**
- Drafting and refining the reasoning strings in the audit engine. My first pass was terse ("Business plan is overkill"). I pasted my draft into Claude with the instruction "rewrite this as a finance-level explanation a CFO would find credible, citing specific numbers." Then edited the output for accuracy. Probably 3–4 hours saved here.
- Debugging the `react-hook-form` silent failure. Pasted my form code + error behavior and asked for hypotheses. Claude's second hypothesis was correct.
- Writing the transactional email HTML. I described what I wanted, it produced a clean inline-style template, I adjusted the pricing variables and conditional sections.

**Cursor (Pro) — used for:**
- Boilerplate Express route handlers (I provided the route spec, Cursor filled in the structure)
- Recharts configuration — I described the chart I wanted, Cursor provided the first draft, I fixed the bar grouping
- Tailwind class combinations in the landing page

**What I didn't trust AI with:**
- The audit engine financial logic — wrote every rule by hand and verified against official pricing pages
- The user interview notes — real conversations, no AI
- ECONOMICS.md math — calculated manually, then sense-checked

**One time AI was wrong:**
I asked Claude to generate the Supabase RLS policies for the `leads` table. It generated `create policy "leads_public_read" on leads for select using (true)` — which would have exposed all lead emails to anyone who could query Supabase directly. Caught it immediately because I knew the intent was to make leads private. Replaced with `using (false)` (denies all client-side access).

---

## 5. Self-ratings

| Dimension | Score | Reason |
|---|---|---|
| **Discipline** | 8/10 | Committed every day for 7 days, no clustering. Lost 2 points for Day 3 where I spent 90 minutes on the Recharts chart — a UI detail — when the audit engine still had 4 tools unfinished. Wrong prioritisation. |
| **Code quality** | 7/10 | The audit engine is clean, testable, and well-reasoned. The frontend components have some props drilling that would be cleaned up with a context provider. The Express routes could use a shared error handler middleware instead of per-route try/catch. |
| **Design sense** | 7/10 | Clean and professional. Not memorable. I optimised for conversion (clear CTAs, strong savings hero) over aesthetics. The results page could be more visually striking with proper charts and animations. |
| **Problem solving** | 8/10 | Found the root cause of the `useFieldArray` bug efficiently once I isolated it. The decision to replace score-based with rules-based was correct and made early. |
| **Entrepreneurial thinking** | 8/10 | Real user interviews, specific GTM with channel-level reasoning, unit economics with actual numbers. Lost 2 points for not building the benchmark mode — the most viral feature — despite identifying it as high-value in interviews. |
