import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  TrendingDown, Share2, ExternalLink, Loader2,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavingsChart } from "@/components/results/SavingsChart";
import { LeadForm } from "@/components/forms/LeadForm";
import { fetchAudit } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { AuditResult, SeverityLevel } from "@/types";

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  optimal: { label: "Optimal", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  minor: { label: "Minor", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  moderate: { label: "Overspending", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  significant: { label: "Significant Waste", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://spendlens.io";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<AuditResult | null>(
    (location.state as { result?: AuditResult })?.result ?? null
  );
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [leadDone, setLeadDone] = useState(false);

  useEffect(() => {
    if (result || !id) return;
    fetchAudit(id)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, result]);

  const shareUrl = `${APP_URL}/audit/${id}`;
  const handleShare = async () => {
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your audit…</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-sm px-4">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Audit not found</h2>
          <p className="text-gray-500 text-sm mb-6">{error ?? "This audit may have expired or the link is incorrect."}</p>
          <Button onClick={() => navigate("/audit")} className="bg-green-600 hover:bg-green-700 text-white">
            Run a new audit
          </Button>
        </div>
      </div>
    );
  }

  const isOptimized = result.totalMonthlySavings < 100;
  const isHighSavings = result.totalMonthlySavings >= 500;

  const ogTitle = result.totalMonthlySavings > 0
    ? `AI Audit: Save ${formatCurrency(result.totalMonthlySavings)}/mo — SpendLens`
    : "AI Spend Audit Results — SpendLens";

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={`AI tool spend audit for a ${result.input.teamSize}-person team. ${result.totalMonthlySavings > 0 ? `Found ${formatCurrency(result.totalMonthlySavings)}/month in savings.` : "Stack is well-optimized."}`} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <TrendingDown className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">SpendLens</span>
            </a>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
                onClick={handleShare}
              >
                <Share2 className="w-3 h-3" />
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                onClick={() => navigate("/audit")}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                New audit
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Hero savings block */}
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            {isOptimized ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're spending well</h2>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Your AI stack is well-optimised for a {result.input.teamSize}-person team.
                  We found under {formatCurrency(100)}/month in potential savings.
                </p>
              </div>
            ) : (
              <div className={`rounded-2xl p-8 text-center ${isHighSavings ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-200"}`}>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
                  Potential monthly savings
                </div>
                <div className="text-6xl font-extrabold text-gray-900 mb-1">
                  {formatCurrency(result.totalMonthlySavings)}
                  <span className="text-2xl font-normal text-gray-400">/mo</span>
                </div>
                <div className="text-xl text-gray-500 mb-3">
                  {formatCurrency(result.totalAnnualSavings)}{" "}
                  <span className="text-gray-400 text-base">per year</span>
                </div>
                <div className="text-sm text-gray-500">
                  Current: {formatCurrency(result.totalMonthlySpend)}/mo →
                  Optimised: {formatCurrency(result.optimizedMonthlySpend)}/mo
                  {" "}({formatPercent(result.savingsPercentage)} reduction)
                </div>
              </div>
            )}
          </motion.div>

          {/* AI Summary */}
          {result.summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">AI</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Personalised summary</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.summary}</p>
            </motion.div>
          )}

          {/* Chart */}
          {!isOptimized && result.recommendations.some((r) => r.monthlySavings > 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <SavingsChart recommendations={result.recommendations} />
            </motion.div>
          )}

          {/* Per-tool breakdown */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tool-by-tool breakdown</h2>
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => {
                const cfg = SEVERITY_CONFIG[rec.severity];
                return (
                  <motion.div
                    key={rec.toolId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`border rounded-xl p-5 ${cfg.border} ${cfg.bg} dark:bg-opacity-10`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rec.severity === "optimal" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{rec.toolName}</h3>
                        <Badge
                          className={`text-xs px-2 py-0.5 ${cfg.color} bg-white border ${cfg.border}`}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      {rec.monthlySavings > 0 && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-gray-900">{formatCurrency(rec.monthlySavings)}/mo</div>
                          <div className="text-xs text-gray-400">{formatCurrency(rec.annualSavings)}/yr</div>
                        </div>
                      )}
                    </div>

                    {/* Plan transition */}
                    {rec.actionType !== "none" && (
                      <div className="flex items-center gap-2 text-xs mb-3 flex-wrap">
                        <code className="bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                          {rec.currentPlan}
                        </code>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <code className={`bg-white border px-2 py-1 rounded font-medium ${rec.monthlySavings > 0 ? "border-green-300 text-green-700" : "border-gray-200 text-gray-600"}`}>
                          {rec.recommendedTool ? `${rec.recommendedTool} — ` : ""}{rec.recommendedPlan}
                        </code>
                        <span className="ml-auto text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded capitalize">
                          {rec.actionType.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {rec.reasoning}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Credex CTA */}
          {isHighSavings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900 dark:bg-black rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">
                    Unlock even more savings with Credex
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    Your audit shows {formatCurrency(result.totalMonthlySavings)}/mo in savings from plan changes alone.
                    Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise — from companies that over-purchased.
                    Customers typically save an additional 20–40% on top.
                  </p>
                  <a
                    href="https://credex.rocks?ref=spendlens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Book a Credex consultation
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lead capture */}
          {!leadDone ? (
            <LeadForm
              auditId={result.id}
              totalMonthlySavings={result.totalMonthlySavings}
              isOptimized={isOptimized}
              onSuccess={() => setLeadDone(true)}
            />
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Report sent to your inbox!</p>
              <p className="text-sm text-gray-500 mt-1">Check for an email with your full audit breakdown.</p>
            </div>
          )}

          {/* Share */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Share this audit</h3>
            <p className="text-sm text-gray-500 mb-4">Personal info stripped. Only tools and savings shown.</p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 text-xs font-mono border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
              />
              <Button
                size="sm"
                onClick={handleShare}
                className="bg-gray-900 hover:bg-gray-700 text-white text-xs whitespace-nowrap"
              >
                {copied ? "✓ Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
