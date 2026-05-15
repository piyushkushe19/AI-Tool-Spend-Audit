import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { SpendForm } from "@/components/forms/SpendForm";
import { runAudit } from "@/lib/api";
import type { AuditInput } from "@/types";

export function AuditPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: AuditInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await runAudit(input);
      navigate(`/audit/${result.id}`, { state: { result } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Run Your AI Spend Audit — SpendLens</title>
        <meta name="description" content="Enter your AI tool stack and get instant savings recommendations." />
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
            <span className="text-xs text-gray-400">Free · No login</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your AI tool stack
              </h1>
              <p className="text-gray-500">
                Add every AI tool your team pays for. Be precise — the audit is only as good as your inputs.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <SpendForm onSubmit={handleSubmit} isLoading={isLoading} />
          </motion.div>
        </main>
      </div>
    </>
  );
}
