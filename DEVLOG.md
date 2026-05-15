# DEVLOG — SpendLens

---

## Day 1 — 2025-05-01

**Hours worked:** 4.5

**What I did:**
Spent the first hour refusing to write code. Read the assignment three times, read the Credex website, read the pricing pages for all eight tools. Built a pricing spreadsheet to verify every plan transition before touching TypeScript. Bootstrapped the monorepo with npm workspaces — one decision I'm glad I made early, since the shared types between client and server saved probably two hours later in the week. Set up Express + TypeScript server skeleton. Got health check route working and returning 200. Set up Vite + React + Tailwind client. Confirmed both run locally with `concurrently`.

**What I learned:**
Cursor Enterprise pricing is not publicly listed. Had to find it from a community post citing a sales call (~$80/seat). Documented it as estimated in `PRICING_DATA.md` with that caveat. GitHub Copilot Individual is $10/month — I had been mentally anchoring on $19 (the Business price) from a screenshot I'd seen. Always go to the official page.

**Blockers / what I'm stuck on:**
The dependent plan dropdown is going to be annoying with `react-hook-form` + `useFieldArray`. Need to intercept `onChange` on the tool select to reset the plan field. Will tackle tomorrow.

**Plan for tomorrow:**
Build the audit engine for Cursor, GitHub Copilot, and Claude. Write the first Vitest tests to drive the implementation (TDD approach). Get the basic form rendering with dynamic rows.

---

## Day 2 — 2025-05-02

**Hours worked:** 7

**What I did:**
Built `audit-engine.ts` for the first four tools (Cursor, GitHub Copilot, Claude, ChatGPT). Used TDD — wrote the test first, then the rule. The Cursor Business → Pro rule was straightforward. Claude Team minimum-seat rule was trickier because I had to decide: do I flag the overspend against the 5-seat minimum cost or against the individual Pro alternative? Chose Pro alternative — that's the actionable recommendation, not a comparison to the minimum. Wrote 8 Vitest tests. 7 passed on first run; one edge case (zero spend) caused a division-by-zero in the savings percentage calc. Fixed with a guard.

**What I learned:**
`react-hook-form`'s `useFieldArray` registers field IDs as part of the form state. I initially tried to spread the tool config into the append call without an `id` field and got silent failures on form submission. Adding `id: uuidv4()` to every `append` call fixed it.

**Blockers / what I'm stuck on:**
Cross-tool overlap detection (multiple coding tools) isn't part of the per-tool rule set — it needs to look at the full input array. Need to decide whether to surface this as an extra recommendation or append it to an existing tool's reasoning. Leaning toward appending to the highest-savings tool.

**Plan for tomorrow:**
Finish audit engine (OpenAI API, Anthropic API, Gemini, Windsurf). Add `detectOverlaps()`. Hook up Supabase. Start the results page.

---

## Day 3 — 2025-05-03

**Hours worked:** 6.5

**What I did:**
Finished all eight tool rules + `detectOverlaps()`. The overlap detection finds multiple simultaneous IDE coding tools and correctly flags the cheaper one(s) as redundant. Set up Supabase project and ran the SQL schema. Tested the `POST /api/audit` route end-to-end — audit result saves, UUID returned. Started results page: hero savings block (conditional on amount), per-tool breakdown cards with severity indicators. Spent 90 minutes on the Recharts bar chart — the grouped bar for current vs optimised spend took longer than expected to configure. ResponsiveContainer + correct margins finally.

**What I learned:**
Supabase RLS `create policy "public_read" on audits for select using (true)` allows unauthenticated reads from the client-side. This is intentional for the public shareable URL. But I need to ensure the `leads` table has a blocking policy so no client-side code can read other people's emails.

**Blockers / what I'm stuck on:**
When the user navigates to `/audit/:id` directly (shared URL), the result isn't in React Router `state` — need a proper `useEffect` fetch. Also: the `not-found` state for the results page looks ugly, need a proper 404 screen.

**Plan for tomorrow:**
Wire up GET /api/audit/:id fetch for direct navigation. Build the lead capture form + POST /api/leads + Resend email. Build the landing page.

---

## Day 4 — 2025-05-04

**Hours worked:** 8.5

**What I did:**
This was the hardest day. Fixed the results page direct-navigation fetch. Built `POST /api/leads` with honeypot, rate limiting, Supabase insert, and Resend email. The Resend transactional email took 2 hours — Gmail strips `<style>` tags, so all styles must be inline. Wrote the full email in a string template with inline styles. Tested in Resend's send logs. Built the full landing page — Hero, How it Works, Savings Examples, Benefits, Social Proof, FAQ, CTA footer — with Framer Motion entrance animations. Built Anthropic summary generation with fallback. Wrote `PROMPTS.md` while the prompt was fresh.

**What I learned:**
Framer Motion's `whileInView` with `viewport={{ once: true }}` is the correct way to trigger animations on scroll without repeating. Using `viewport={{ once: false }}` caused elements to re-animate on scroll up, which looked broken. Also: `staggerChildren` only works if the parent has `variants` defined, even if the parent itself doesn't animate.

**Blockers / what I'm stuck on:**
The Anthropic API is slow (~2-3 seconds) for the summary. The current architecture blocks the `/api/audit` response on it. This is fine for MVP but would need to move to async queue at scale. For now, adding a timeout of 8 seconds and using fallback if exceeded.

**Plan for tomorrow:**
Fix the API timeout. Build the shareable URL public page with OG tags. Write all documentation files. Conduct user interviews.

---

## Day 5 — 2025-05-05

**Hours worked:** 6

**What I did:**
Added an 8-second timeout on the Anthropic call using `Promise.race` with a `setTimeout` rejection. Works correctly — falls back to template without hanging the response. Built OG image route as an SVG response at `/api/og`. React Helmet Async populates the `<meta>` tags on the results page from the fetched audit data. Conducted first two user interviews (see USER_INTERVIEWS.md). The second interview (engineering manager) surfaced a genuine bug: when the plan select resets on tool change, it doesn't reset the `monthlySpend` field — users could have stale spend values from a previous tool selection. Added a `setValue` call for `monthlySpend: 0` on tool change. Deployed to Vercel (frontend) + Render (backend) preview.

**What I learned:**
React Helmet Async requires the `HelmetProvider` to wrap the entire app at the root level. I initially put it inside `App.tsx` below the `BrowserRouter`, which caused the Helmet context to be missing. Moved it up to `main.tsx`.

**Blockers / what I'm stuck on:**
Render's free tier cold starts add ~15 seconds on the first request after inactivity. The `/api/audit` call appears broken to users on cold start. Adding a health check ping from the frontend on app mount to pre-warm the server.

**Plan for tomorrow:**
Add server pre-warm on frontend mount. Write GTM.md, ECONOMICS.md, TESTS.md, METRICS.md. Third user interview.

---

## Day 6 — 2025-05-06

**Hours worked:** 5.5

**What I did:**
Added a silent pre-warm call to `/health` on app mount in `main.tsx` — fires and forgets, just wakes the Render instance. Conducted third user interview (indie hacker using three paid AI tools simultaneously). Wrote GTM.md, ECONOMICS.md, METRICS.md, USER_INTERVIEWS.md, LANDING_COPY.md. Went back and rewrote all the audit engine reasoning strings after the user interviews showed that "short" reasoning wasn't credible — every string is now a full sentence with specific dollar amounts and references to the plan features that do/don't apply. Ran `npm test` — all 16 tests passing.

**What I learned:**
The most important product insight of the week: users don't just want to know the savings number. They want to know *why* the recommendation is correct, so they can explain it to someone else (their manager, their CFO). The reasoning string is the product. Everything else is UI chrome.

**Blockers / what I'm stuck on:**
User interview 3 surfaced that the "seats" field is confusing — the user thinks in "monthly bill" not "seats." Would add a helper text showing implied per-seat cost (spend ÷ seats) in a future version.

**Plan for tomorrow:**
Final polish. Write REFLECTION.md. Verify git history (≥5 days). Final smoke test on production URL. Submit.

---

## Day 7 — 2025-05-07

**Hours worked:** 4

**What I did:**
Added a per-seat cost helper tooltip in the SpendForm — shows `$X/seat` next to the spend field when seats > 1. Wrote REFLECTION.md. Ran final smoke test: form → audit → results → share URL → email → inbox. All working. Verified git log: commits on 7 distinct calendar days. Added `PRICING_DATA.md` final verification pass — rechecked all 8 tools' pricing pages against what's in the engine. One discrepancy found: Gemini Advanced is $19.99/month not $20 — updated the display label. Submitted.

**What I learned:**
The product-level insight I'll carry forward: a free audit tool is only trustworthy if the underlying data (pricing) is more accurate than what the user can find by Googling. That's the moat — not the AI summary, not the design. The willingness to manually verify 40+ pricing entries and document sources is what separates a tool people share from one they dismiss.

**Blockers / what I'm stuck on:**
Nothing blocking. PDF export bonus feature didn't make it — would need `@react-pdf/renderer` and another day. Documented in REFLECTION.md week 2 scope.
