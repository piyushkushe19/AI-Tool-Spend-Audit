export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "openai_api"
  | "anthropic_api"
  | "gemini"
  | "windsurf";

export type UseCase =
  | "coding"
  | "writing"
  | "research"
  | "mixed"
  | "data_analysis";

export interface ToolEntry {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export type SeverityLevel = "optimal" | "minor" | "moderate" | "significant";
export type ActionType =
  | "downgrade"
  | "switch"
  | "consolidate"
  | "optimize_api"
  | "none";

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedTool?: string;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  severity: SeverityLevel;
  actionType: ActionType;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  optimizedMonthlySpend: number;
  savingsPercentage: number;
  summary?: string;
  createdAt: string;
}
