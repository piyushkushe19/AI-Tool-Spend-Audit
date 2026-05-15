# 🚀 SpendLens — AI Tool Spend Audit Platform

> A modern free web app that helps startups and engineering teams analyze, optimize, and reduce unnecessary AI tool spending in under 60 seconds.

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/UI-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel" />
</p>

---

# 📌 Problem Statement

Modern startups spend thousands of dollars every month on AI tools like:

- ChatGPT
- Claude
- Gemini
- Midjourney
- GitHub Copilot
- Notion AI
- Cursor
- Perplexity

Most teams:
- overpay for unused seats
- subscribe to overlapping tools
- have no centralized visibility
- lack cost optimization insights

**SpendLens solves this problem** by generating instant AI spending audits with actionable savings recommendations.

---

# ✨ Key Features

## 🔍 AI Spend Audit Engine
- Analyze AI subscriptions across teams
- Detect duplicate or overlapping tools
- Identify unused or underutilized plans
- Suggest optimized alternatives
- Calculate monthly & yearly savings

## 📊 Interactive Analytics Dashboard
- Real-time spend breakdown
- Team-wise cost distribution
- Savings visualization charts
- Optimized budget projections
- Financial insights summary

## 🤖 AI-Powered Recommendations
- Claude-generated executive summary
- Personalized optimization suggestions
- Actionable cost reduction insights
- Natural-language financial reporting

## 💾 Smart Persistence
- localStorage form persistence
- Shareable audit URLs
- Public audit reports
- SEO-optimized audit pages

## 📧 Lead Capture & Conversion
- Email gating after value delivery
- Automated transactional emails
- Anti-spam protection
- Conditional CTA logic

---

# 🖼️ Screenshots

## Landing Page
<p align="center">
  <img src="./screenshots/La" alt="Landing Page" width="100%" />
</p>

## Audit Form
> Add screenshot here

## Audit Results Dashboard
> Add screenshot here

## Public Shareable Audit
> Add screenshot here

---

# 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM |
| Animation | Framer Motion |
| Backend | Node.js + Express.js |
| Database | Supabase PostgreSQL |
| AI Integration | Anthropic Claude API |
| Validation | Zod |
| Email Service | Resend |
| Testing | Vitest |
| Deployment | Vercel + Render |

---

# 🧠 Architecture

```text
Client (React + Vite)
        ↓
Express API Server
        ↓
Audit Engine (Pure TypeScript Logic)
        ↓
Anthropic Claude Summary Generation
        ↓
Supabase PostgreSQL
        ↓
Public Audit Results + Email Capture
```

---

# ⚡ Performance & Engineering Decisions

## Deterministic Audit Engine
Financial calculations are handled using pure TypeScript rules instead of AI-generated logic.

### Why?
- Predictable outputs
- Faster performance
- Fully testable
- Finance-grade consistency
- Lower API costs

---

## Monorepo Architecture
Used npm workspaces to manage frontend and backend together.

### Benefits
- Shared TypeScript types
- Easier deployment
- Unified development workflow
- Cleaner CI/CD setup

---

## Local Persistence Strategy
Implemented localStorage persistence instead of authentication for MVP simplicity.

### Benefits
- Faster onboarding
- No login friction
- Zero backend session overhead

---

# 📂 Project Structure

```bash
spendlens/
│
├── client/                 # Frontend React App
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── lib/
│
├── server/                 # Express Backend
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── utils/
│
├── shared/                 # Shared Types
│
├── README.md
├── package.json
└── .gitignore
```

---

# 🚀 Local Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/piyushkushe19/AI-Tool-Spend-Audit.git
cd AI-Tool-Spend-Audit
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

### Backend

```bash
cp server/.env.example server/.env
```

Add:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

### Frontend

```bash
cp client/.env.example client/.env
```

Add:

```env
VITE_API_URL=
VITE_APP_URL=
```

---

## 4️⃣ Run Development Server

```bash
npm run dev
```

Frontend:
```bash
http://localhost:5173
```

Backend:
```bash
http://localhost:3001
```

---

# 🧪 Running Tests

```bash
npm test
```

---

# 📈 Future Improvements

- Multi-organization support
- Real SaaS billing integrations
- Stripe subscription tracking
- AI forecasting models
- Team collaboration dashboard
- Admin analytics portal
- Exportable PDF audit reports
- Redis-based distributed rate limiting

---

# 🌍 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |

---

# 🔐 Security Features

- Rate limiting
- Input validation with Zod
- Environment variable protection
- Honeypot spam prevention
- Sanitized API responses
- Secure server-side secrets

---

# 📊 Example Audit Insights

| Tool | Current Spend | Suggested Action | Savings |
|---|---|---|---|
| ChatGPT Team | $120/mo | Reduce unused seats | $40 |
| Claude Pro | $80/mo | Merge with ChatGPT usage | $30 |
| Midjourney | $60/mo | Downgrade plan | $20 |

---

# 💡 Why This Project Stands Out

✅ Real-world SaaS business problem  
✅ Production-style architecture  
✅ AI integration with practical usage  
✅ Financial optimization logic  
✅ Modern frontend engineering  
✅ Scalable backend structure  
✅ Clean developer experience  
✅ Strong product thinking  
