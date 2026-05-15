import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

export const USE_CASE_LABELS: Record<string, string> = {
  coding: "Software Development / Coding",
  writing: "Content Writing / Marketing",
  research: "Research & Analysis",
  mixed: "Mixed / General Purpose",
  data_analysis: "Data Analysis",
};

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude (Anthropic)",
  chatgpt: "ChatGPT (OpenAI)",
  openai_api: "OpenAI API",
  anthropic_api: "Anthropic API",
  gemini: "Google Gemini",
  windsurf: "Windsurf",
};

export const TOOL_PLANS: Record<string, { value: string; label: string }[]> = {
  cursor: [
    { value: "hobby", label: "Hobby (Free)" },
    { value: "pro", label: "Pro — $20/mo" },
    { value: "business", label: "Business — $40/mo" },
    { value: "enterprise", label: "Enterprise" },
  ],
  github_copilot: [
    { value: "individual", label: "Individual — $10/mo" },
    { value: "business", label: "Business — $19/mo" },
    { value: "enterprise", label: "Enterprise — $39/mo" },
  ],
  claude: [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro — $20/mo" },
    { value: "max", label: "Max — $100/mo" },
    { value: "max_20x", label: "Max 20× — $200/mo" },
    { value: "team", label: "Team — $30/mo (min 5 seats)" },
    { value: "enterprise", label: "Enterprise" },
    { value: "api", label: "API Direct" },
  ],
  chatgpt: [
    { value: "free", label: "Free" },
    { value: "plus", label: "Plus — $20/mo" },
    { value: "team", label: "Team — $30/mo" },
    { value: "enterprise", label: "Enterprise" },
    { value: "api", label: "API Direct" },
  ],
  openai_api: [{ value: "payg", label: "Pay-as-you-go" }],
  anthropic_api: [{ value: "payg", label: "Pay-as-you-go" }],
  gemini: [
    { value: "free", label: "Free" },
    { value: "advanced", label: "Advanced (AI Premium) — $19.99/mo" },
    { value: "workspace_business", label: "Workspace Business — $20/mo" },
    { value: "workspace_enterprise", label: "Workspace Enterprise — $30/mo" },
    { value: "api", label: "API (Vertex AI)" },
  ],
  windsurf: [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro — $15/mo" },
    { value: "teams", label: "Teams — $35/mo" },
    { value: "enterprise", label: "Enterprise" },
  ],
};
