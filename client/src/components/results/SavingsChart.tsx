import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ToolRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SavingsChartProps {
  recommendations: ToolRecommendation[];
}

const COLORS = {
  significant: "#ef4444",
  moderate: "#f97316",
  minor: "#eab308",
  optimal: "#22c55e",
};

export function SavingsChart({ recommendations }: SavingsChartProps) {
  const data = recommendations
    .filter((r) => r.currentSpend > 0 || r.monthlySavings > 0)
    .map((r) => ({
      name: r.toolName.replace(" (Anthropic)", "").replace(" (OpenAI)", ""),
      current: r.currentSpend,
      optimized: r.recommendedSpend,
      savings: r.monthlySavings,
      severity: r.severity,
    }))
    .sort((a, b) => b.savings - a.savings);

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Spend breakdown</h3>
      <p className="text-xs text-gray-400 mb-4">Current vs. optimised monthly spend per tool</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "current" ? "Current" : "Optimised",
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          />
          <Bar dataKey="current" name="current" radius={[4, 4, 0, 0]} fill="#e2e8f0">
            {data.map((entry, i) => (
              <Cell key={i} fill="#e2e8f0" />
            ))}
          </Bar>
          <Bar dataKey="optimized" name="optimized" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.severity]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-200" />
          <span className="text-xs text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-gray-400">Optimised</span>
        </div>
      </div>
    </div>
  );
}
