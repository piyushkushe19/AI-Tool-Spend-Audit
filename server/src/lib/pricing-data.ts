/**
 * AI Tool Pricing Reference Data
 * Sources verified from official vendor pages — see PRICING_DATA.md
 * Last verified: 2025-05-07
 */

export interface PlanConfig {
  name: string;
  pricePerSeat: number;
  minSeats?: number;
  features?: string[];
  billingNote?: string;
}

export interface ToolConfig {
  displayName: string;
  plans: Record<string, PlanConfig>;
  primaryCategory: "coding" | "general" | "api";
  bestForUseCases: string[];
}

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  cursor: {
    displayName: "Cursor",
    primaryCategory: "coding",
    bestForUseCases: ["coding"],
    plans: {
      hobby: {
        name: "Hobby",
        pricePerSeat: 0,
        billingNote: "Free with limited completions",
      },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        billingNote: "$20/user/month",
      },
      business: {
        name: "Business",
        pricePerSeat: 40,
        billingNote: "$40/user/month — adds admin, privacy mode",
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 80,
        billingNote: "~$80/user/month — estimated, custom pricing",
      },
    },
  },
  github_copilot: {
    displayName: "GitHub Copilot",
    primaryCategory: "coding",
    bestForUseCases: ["coding"],
    plans: {
      individual: {
        name: "Individual",
        pricePerSeat: 10,
        billingNote: "$10/user/month or $100/year",
      },
      business: {
        name: "Business",
        pricePerSeat: 19,
        billingNote: "$19/user/month",
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 39,
        billingNote: "$39/user/month",
      },
    },
  },
  claude: {
    displayName: "Claude (Anthropic)",
    primaryCategory: "general",
    bestForUseCases: ["coding", "writing", "research", "mixed"],
    plans: {
      free: { name: "Free", pricePerSeat: 0 },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        billingNote: "$20/user/month",
      },
      max: {
        name: "Max",
        pricePerSeat: 100,
        billingNote: "$100/user/month — 5× Pro usage",
      },
      max_20x: {
        name: "Max 20×",
        pricePerSeat: 200,
        billingNote: "$200/user/month — 20× Pro usage",
      },
      team: {
        name: "Team",
        pricePerSeat: 30,
        minSeats: 5,
        billingNote: "$30/user/month — min 5 seats",
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 60,
        billingNote: "~$60/user/month — custom pricing",
      },
      api: { name: "API", pricePerSeat: 0, billingNote: "Pay-per-token" },
    },
  },
  chatgpt: {
    displayName: "ChatGPT (OpenAI)",
    primaryCategory: "general",
    bestForUseCases: ["coding", "writing", "research", "mixed"],
    plans: {
      free: { name: "Free", pricePerSeat: 0 },
      plus: {
        name: "Plus",
        pricePerSeat: 20,
        billingNote: "$20/user/month",
      },
      team: {
        name: "Team",
        pricePerSeat: 30,
        minSeats: 2,
        billingNote: "$30/user/month — min 2 seats",
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 60,
        billingNote: "~$60/user/month — custom pricing",
      },
      api: { name: "API", pricePerSeat: 0, billingNote: "Pay-per-token" },
    },
  },
  openai_api: {
    displayName: "OpenAI API",
    primaryCategory: "api",
    bestForUseCases: ["coding", "writing", "research", "mixed", "data_analysis"],
    plans: {
      payg: {
        name: "Pay-as-you-go",
        pricePerSeat: 0,
        billingNote: "Token-based billing",
      },
    },
  },
  anthropic_api: {
    displayName: "Anthropic API",
    primaryCategory: "api",
    bestForUseCases: ["coding", "writing", "research", "mixed", "data_analysis"],
    plans: {
      payg: {
        name: "Pay-as-you-go",
        pricePerSeat: 0,
        billingNote: "Token-based billing",
      },
    },
  },
  gemini: {
    displayName: "Google Gemini",
    primaryCategory: "general",
    bestForUseCases: ["writing", "research", "mixed"],
    plans: {
      free: { name: "Free", pricePerSeat: 0 },
      advanced: {
        name: "Advanced (AI Premium)",
        pricePerSeat: 19.99,
        billingNote: "$19.99/user/month — Google One AI Premium",
      },
      workspace_business: {
        name: "Workspace Business",
        pricePerSeat: 20,
        billingNote: "$20/user/month — Gemini for Workspace Business",
      },
      workspace_enterprise: {
        name: "Workspace Enterprise",
        pricePerSeat: 30,
        billingNote: "$30/user/month — Gemini for Workspace Enterprise",
      },
      api: { name: "API", pricePerSeat: 0, billingNote: "Token-based via Vertex AI" },
    },
  },
  windsurf: {
    displayName: "Windsurf (Codeium)",
    primaryCategory: "coding",
    bestForUseCases: ["coding"],
    plans: {
      free: { name: "Free", pricePerSeat: 0, billingNote: "Limited AI flows" },
      pro: {
        name: "Pro",
        pricePerSeat: 15,
        billingNote: "$15/user/month",
      },
      teams: {
        name: "Teams",
        pricePerSeat: 35,
        billingNote: "$35/user/month",
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 60,
        billingNote: "~$60/user/month — custom",
      },
    },
  },
};

export function getPlanPrice(tool: string, plan: string): number {
  return TOOL_CONFIGS[tool]?.plans[plan]?.pricePerSeat ?? 0;
}

export function getDisplayName(tool: string): string {
  return TOOL_CONFIGS[tool]?.displayName ?? tool;
}

export const CODING_TOOLS = ["cursor", "github_copilot", "windsurf"];
export const GENERAL_AI_TOOLS = ["claude", "chatgpt", "gemini"];
export const API_TOOLS = ["openai_api", "anthropic_api"];
