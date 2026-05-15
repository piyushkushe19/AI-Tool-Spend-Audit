# SpendLens — AI Tool Spend Audit

**A free web app that helps startup founders and engineering managers find out if they're overpaying for AI tools.**

Enter your stack, get an instant audit with finance-level reasoning, and see exactly where to cut costs — in under 60 seconds. 

---

## Screenshots

> Add 3+ screenshots or a Loom/YouTube link after first deploy:
> - Landing page hero
> - Filled audit form (3–4 tools)
> - Results page: $500+/mo savings with Credex CTA
> - Results page: "You're spending well" state
> - Shareable public URL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM v6 |
| Animations | Framer Motion |
| SEO | React Helmet Async |
| Backend | Express.js + TypeScript |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| AI | Anthropic Claude (summary only) |
| Testing | Vitest |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- **Spend input form** — 8 tools, dynamic add/remove rows, localStorage persistence, Zod validation
- **Audit engine** — 100% deterministic rules, no AI for financial logic
- **Results dashboard** — per-tool breakdown, savings chart, conditional Credex CTA
- **AI summary** — Claude-generated personalised summary with graceful fallback
- **Lead capture** — email gate after value shown, Resend transactional email, honeypot + rate limiting
- **Shareable URLs** — unique public link per audit, OG/Twitter card metadata

---

## Setup

### Prerequisites
- Node.js 20+
- Supabase project
- Anthropic API key
- Resend account

### Install

```bash
git clone https://github.com/your-org/spendlens.git
cd spendlens
npm install
```

### Configure environment

```bash
# Backend
cp server/.env.example server/.env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY

# Frontend
cp client/.env.example client/.env
# fill in VITE_API_URL, VITE_APP_URL
```

### Supabase schema

Run this in your Supabase SQL editor:

```sql
create table audits (
  id uuid primary key,
  input jsonb not null,
  recommendations jsonb not null,
  total_monthly_spend numeric not null,
  total_monthly_savings numeric not null,
  total_annual_savings numeric not null,
  optimized_monthly_spend numeric not null,
  savings_percentage numeric not null,
  summary text,
  created_at timestamptz default now()
);

create table audit_tools (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references audits(id) on delete cascade,
  tool_name text not null,
  plan text not null,
  monthly_spend numeric not null,
  seats integer not null,
  monthly_savings numeric not null,
  recommended_plan text,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references audits(id) on delete set null,
  email text not null,
  company_name text,
  role text,
  team_size integer,
  total_monthly_savings numeric,
  created_at timestamptz default now()
);

alter table audits enable row level security;
create policy "public_read" on audits for select using (true);
create policy "service_insert" on audits for insert with check (true);

alter table leads enable row level security;
create policy "service_only" on leads using (false);
```

### Run locally

```bash
npm run dev          # starts both client (5173) and server (3001)
# or individually:
npm run dev --workspace=server
npm run dev --workspace=client
```

### Run tests

```bash
npm test             # runs server audit engine tests
```

---

### Backend (Render)

1. Connect GitHub repo to Render
2. Root directory: `server`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add all environment variables from `server/.env.example`

---

## Architecture Overview

```
Browser (React + Vite)
  ↓ POST /api/audit
Express API (Node.js)
  ↓ runAudit() — pure TS, no network
  ↓ generateAuditSummary() — Anthropic API
  ↓ supabase.insert()
  ↑ returns AuditResult with ID
Browser redirects to /audit/:id
  ↓ GET /api/audit/:id
  ↑ public audit data (no personal info)
Results page renders
  ↓ POST /api/leads — on email submit
  → Supabase leads insert + Resend email
```

---

## Decisions

Five meaningful trade-offs made during the build:

1. **Audit engine is pure deterministic TypeScript, no AI.** Financial recommendations need to be auditable, reproducible, and testable. A rules engine is faster, cheaper, and more credible to a finance professional than an LLM. AI is reserved for the ~100-word summary where synthesis adds value.

2. **Monorepo with npm workspaces over separate repos.** Shared types (AuditResult, ToolRecommendation) live in one place, CI runs in one file, and local development uses a single `npm run dev`. The downside — slightly more complex CI — is minimal.

3. **localStorage for form persistence over server-side sessions.** No login means no user identity. localStorage is instant, zero-infra, and survives a page refresh. Acceptable trade-off: loses state on cross-device visits.

4. **In-memory rate limiting over Redis.** An Upstash Redis rate limiter is correct for production. For MVP, in-memory covers 95% of abuse cases at zero cost. The upgrade path is documented in comments.

5. **OG images as SVG via `/api/og` over `@vercel/og`.** Zero additional dependency, works on any host, fast. Downside: rendered as SVG, not a real image — Twitter/OG may not render it as a photo preview on all platforms. Upgrade to `@vercel/og` if this matters.

---

