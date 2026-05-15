# User Interviews — SpendLens

Three conversations with potential users. 12–15 minutes each. Conducted May 5–6, 2025.

---

## Interview 1 — R.T., CTO, 22-person B2B SaaS (Series A)

**Background:** Cold DM on X after he posted about his AWS bill. Responded immediately, 15-minute call that evening.

**Direct quotes:**

> "We have Cursor Business for the whole eng team, GitHub Copilot that nobody renewed the cancellation on, and I think three people on ChatGPT Plus that I approved individually six months ago. I genuinely don't know our total AI bill off the top of my head."

> "The problem isn't that it's expensive — it's that I have no benchmark. What does a 20-person eng team normally spend on AI tools? I have no idea if we're 1x or 3x the median."

> "I signed off on Business because the account exec said 'this is for teams.' I didn't dig into what Business actually adds over Pro."

**Most surprising thing:** He had active GitHub Copilot Business seats auto-renewing for the entire eng team — but the team had migrated to Cursor six months ago and nobody had cancelled Copilot. He knew something was off but hadn't had 30 minutes to investigate. The conversation surfaced ~$380/year in pure zombie subscription spend that would have appeared immediately in a SpendLens audit.

**What it changed about my design:** Added overlap detection explicitly because of this. The overlap flag "you're paying for two simultaneous IDE coding assistants" would have been the single most valuable output for R.T. Also: the results page now surfaces overlap flags prominently, not buried in a footnote.

---

## Interview 2 — A.K., Engineering Manager, 31-person fintech startup

**Background:** Found via Rands in Repose Slack after posting a question about AI tool budgets. She agreed to chat immediately — it was something she was actively thinking about.

**Direct quotes:**

> "I do quarterly software spend reviews. AI tools are the one category where I always feel behind — the pricing changed, there's a new plan, something got bundled into something else."

> "The reasoning matters more than the number. I can't take 'cancel Copilot' to my CFO — I need to explain why in a way that doesn't make engineering look like we're just cutting corners."

> "I would share this audit with my reports so they understand why we made the change. Right now when I cancel a tool they think it's just budget pressure. If there's a written reason, it's a conversation starter."

**Most surprising thing:** She asked, before even seeing the tool, whether the recommendations would cite official pricing sources. She'd previously used a vendor comparison site that had six-month-old pricing and made a budget justification that turned out to be wrong when the CFO fact-checked it. The experience had made her paranoid about third-party pricing claims. `PRICING_DATA.md` and source citations in the reasoning strings are directly responses to this.

**What it changed about my design:** Every reasoning string now references specific plan features being (or not being) used at the team's scale. Not just "downgrade saves $X" — but "this plan adds SAML SSO and centralized billing, which are irrelevant below 5 users." The reasoning has to be citable, not just correct.

---

## Interview 3 — M.O., Solo founder, pre-revenue AI writing tool

**Background:** Fellow indie hacker who shared the prototype in a group chat and agreed to a quick call.

**Direct quotes:**

> "I pay for Claude Pro, ChatGPT Plus, and Gemini Advanced. Honestly I keep all three because I never know which one is going to be better for a specific thing."

> "Twenty dollars a month each doesn't feel like a lot individually. But that's sixty dollars a month. That's $720 a year. I'd never spend $720 on any other single software thing without thinking carefully."

> "I never thought about it from the 'what's my primary use case' angle. I just... use them all for everything. Which is probably the problem."

**Most surprising thing:** He had no idea Gemini Advanced (Google One AI Premium) was a consumer product without business data protections, while his writing tool involved client content. He was using a consumer plan for what should be professional use. The audit surfaced this as a "switch to Workspace Business plan" flag — not primarily a cost issue (the plans are nearly the same price) but a compliance posture issue. The tool catches things beyond pure cost optimization.

**What it changed about my design:** The Gemini audit rule now explicitly calls out the data protection difference between the consumer Advanced plan and the Workspace Business plan: "Gemini Advanced (Google One AI Premium) is a consumer product without data handling commitments required for professional use." The tool's value isn't only cost savings — it's also catching tooling misconfigurations.

---

## Synthesis

Across all three interviews, the consistent themes were:
1. **People know approximately what they pay but not why they're on each plan** — the "I approved it because the rep said so" pattern
2. **The reasoning string is the product**, not the savings number — needed to justify decisions to others (CFO, team, board)
3. **Overlap and zombie subscriptions** are the most common quick wins — multiple coding tools, tools that weren't cancelled after migration
4. **Benchmarks are desired** — "what does a team my size normally spend" — which informed the Week 2 benchmark mode feature idea
