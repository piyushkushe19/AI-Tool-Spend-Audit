import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  TrendingDown, Zap, Shield, BarChart3, ChevronRight,
  CheckCircle2, Star, ArrowRight, DollarSign, Users, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://spendlens.io";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>SpendLens — Free AI Tool Spend Audit</title>
        <meta name="description" content="Find out if you're overpaying for AI tools. Free 60-second audit for your Cursor, Claude, ChatGPT, and more." />
        <meta property="og:title" content="SpendLens — Free AI Tool Spend Audit" />
        <meta property="og:description" content="Free 60-second audit. Find out exactly where you're overspending on AI tools." />
        <meta property="og:url" content={APP_URL} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">SpendLens</span>
              <span className="text-gray-400 text-sm hidden sm:block">by Credex</span>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-sm h-8"
              onClick={() => navigate("/audit")}
            >
              Free Audit
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-400/5 rounded-full blur-3xl" />
          </div>
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-6">
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs font-medium px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-2 animate-pulse" />
                  Free · No login · Results in 60 seconds
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6"
              >
                Are you overpaying
                <br />
                <span className="gradient-text">for AI tools?</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
              >
                Get an instant audit of your AI stack. See exactly where
                you're overspending, what to switch, and how much you'd save —
                with finance-level reasoning, not guesswork.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 h-12 text-base shadow-sm"
                  onClick={() => navigate("/audit")}
                >
                  Run Free Audit
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 text-base border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  See how it works
                </Button>
              </motion.div>

              {/* Stats strip */}
              <motion.div
                variants={fadeUp}
                className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12"
              >
                {[
                  { icon: DollarSign, value: "$340", label: "avg. monthly savings" },
                  { icon: Users, value: "2,400+", label: "audits completed" },
                  { icon: Clock, value: "60s", label: "time to complete" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Icon className="w-4 h-4 text-green-500" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How it works
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto">
                Three steps. No login. No credit card. Just answers.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {[
                {
                  step: "01",
                  icon: BarChart3,
                  title: "Enter your stack",
                  desc: "Tell us which AI tools you pay for, which plan, how many seats, and your monthly spend. Takes 60 seconds.",
                },
                {
                  step: "02",
                  icon: Zap,
                  title: "Audit engine runs",
                  desc: "Our rules engine analyzes plan fit, seat efficiency, and cross-tool redundancy with finance-grade reasoning.",
                },
                {
                  step: "03",
                  icon: TrendingDown,
                  title: "Get your savings report",
                  desc: "See your per-tool breakdown, total savings, and share a public link with your team or board.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 relative"
                >
                  <div className="absolute top-4 right-4 text-3xl font-black text-gray-100 dark:text-gray-700">
                    {step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Savings examples */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Common savings we find
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500">
                Real optimisations from our audit engine.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-4"
            >
              {[
                {
                  tag: "Plan mismatch",
                  from: "Cursor Business · 2 seats · $80/mo",
                  to: "Cursor Pro · 2 seats · $40/mo",
                  save: "$40/mo",
                  reason: "Business plan adds SAML SSO and admin controls — irrelevant below 5 users.",
                },
                {
                  tag: "Enterprise overkill",
                  from: "GitHub Copilot Enterprise · 5 seats · $195/mo",
                  to: "Copilot Business · 5 seats · $95/mo",
                  save: "$100/mo",
                  reason: "Enterprise features (Copilot Chat on GitHub.com, fine-tuned models) only add value at 25+ developers.",
                },
                {
                  tag: "Minimum seat waste",
                  from: "Claude Team · 3 users · $150/mo",
                  to: "Claude Pro × 3 · $60/mo",
                  save: "$90/mo",
                  reason: "Team plan has a 5-seat minimum. You're paying for 2 unused seats vs. individual Pro.",
                },
                {
                  tag: "API vs seat optimisation",
                  from: "Anthropic API · $800/mo · 10-person team",
                  to: "Claude Team · $300/mo · 10 seats",
                  save: "$500/mo",
                  reason: "At $80/person in API costs, seat-based plans offer unlimited usage at $30/seat with predictable billing.",
                },
              ].map(({ tag, from, to, save, reason }) => (
                <motion.div
                  key={tag}
                  variants={fadeUp}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{tag}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm mb-2 flex-wrap">
                      <span className="text-gray-400 line-through">{from}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{to}</span>
                    </div>
                    <p className="text-xs text-gray-500">{reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-green-600">{save}</div>
                    <div className="text-xs text-gray-400">saved</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeUp}>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Why teams trust SpendLens
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: Shield,
                      title: "Finance-grade reasoning",
                      desc: "Every recommendation cites specific dollar amounts and plan differences — credible enough to share with your CFO.",
                    },
                    {
                      icon: Zap,
                      title: "Deterministic, not hallucinated",
                      desc: "The audit engine uses rules, not AI guesses. Results are reproducible and traceable to official pricing pages.",
                    },
                    {
                      icon: BarChart3,
                      title: "Shareable public reports",
                      desc: "Each audit gets a unique URL with personal info stripped. Share with your board, your team, or on social.",
                    },
                    {
                      icon: TrendingDown,
                      title: "Credex credit network",
                      desc: "For teams with significant spend, Credex can unlock additional 20-40% discounts via their enterprise credit marketplace.",
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">{title}</h4>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                {/* Mock audit card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Sample audit result</div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 text-center mb-4">
                    <div className="text-xs text-gray-500 mb-1">Monthly savings identified</div>
                    <div className="text-4xl font-black text-green-600">$630</div>
                    <div className="text-sm text-gray-400">$7,560/year</div>
                  </div>
                  {[
                    { tool: "Cursor", saving: "$40", action: "Downgrade Business → Pro" },
                    { tool: "GitHub Copilot", saving: "$100", action: "Downgrade Enterprise → Business" },
                    { tool: "Anthropic API", saving: "$490", action: "Switch to Claude Team seats" },
                  ].map(({ tool, saving, action }) => (
                    <div key={tool} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{tool}</div>
                        <div className="text-xs text-gray-400">{action}</div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{saving}/mo</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What teams say
              </motion.h2>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {[
                {
                  quote: "Found $480/month in waste in under 5 minutes. The reasoning was specific enough to take straight to our CFO.",
                  name: "R.T.",
                  role: "CTO",
                  company: "B2B SaaS, Series A",
                },
                {
                  quote: "I knew we were double-paying for coding tools. This confirmed it and showed me exactly which one to cancel.",
                  name: "A.K.",
                  role: "Engineering Manager",
                  company: "35-person fintech",
                },
                {
                  quote: "Never thought about AI spend from a primary use case angle before. Changed how I think about our tool stack entirely.",
                  name: "M.O.",
                  role: "Founder",
                  company: "AI writing tool",
                },
              ].map(({ quote, name, role, company }) => (
                <motion.div
                  key={name}
                  variants={fadeUp}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">"{quote}"</p>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{name}</div>
                    <div className="text-xs text-gray-400">{role} · {company}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Frequently asked questions
              </motion.h2>
              <motion.div variants={stagger} className="space-y-6">
                {[
                  {
                    q: "Is this actually free?",
                    a: "Yes. The audit is completely free, no credit card required. We show results before asking for your email — never the other way around.",
                  },
                  {
                    q: "How accurate is the pricing data?",
                    a: "We verify all vendor pricing pages weekly. Every number traces to an official source URL in our PRICING_DATA.md. If you spot an error, email us.",
                  },
                  {
                    q: "Who is Credex?",
                    a: "Credex sells discounted AI infrastructure credits sourced from companies that over-purchased enterprise subscriptions. For high-spend audits, we surface Credex as an additional savings channel on top of what this tool finds.",
                  },
                  {
                    q: "Is the AI used to calculate savings?",
                    a: "No — deliberately. The audit engine is 100% deterministic rules-based code. AI is only used for the personalised summary paragraph. Financial recommendations need to be reproducible and testable.",
                  },
                  {
                    q: "What if my spend is already optimised?",
                    a: "We tell you honestly. 'You're spending well' is a real outcome. We also offer to notify you when better pricing or alternatives emerge for your stack.",
                  },
                ].map(({ q, a }) => (
                  <motion.div key={q} variants={fadeUp} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {q}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed pl-6">{a}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA footer */}
        <section className="py-24 px-4 sm:px-6 bg-gray-900 dark:bg-black">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-white mb-4">
              Find out what you're overpaying
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-8">
              Free. 60 seconds. Finance-level reasoning.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-400 text-white font-bold px-10 h-14 text-lg shadow-lg"
                onClick={() => navigate("/audit")}
              >
                Run Free Audit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <TrendingDown className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">SpendLens</span>
              <span className="text-gray-400 text-xs">by Credex</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Credex.rocks
              </a>
              <a href="mailto:hello@credex.rocks" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
