export interface Plan {
  id: "free" | "pro" | "premium";
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  readingsPerDay: number; // -1 = unlimited
  features: string[];
  aiModel: "basic" | "priority" | "premium";
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    readingsPerDay: 5,
    features: ["5 AI readings per day", "Basic analysis", "Standard AI model"],
    aiModel: "basic",
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    readingsPerDay: -1,
    features: [
      "Unlimited AI readings",
      "Detailed analysis",
      "Premium AI models (GPT-4o, Claude, Gemini Pro)",
      "Priority support",
      "Deeper, more detailed readings",
    ],
    aiModel: "priority",
  },
  premium: {
    id: "premium",
    name: "Premium",
    monthlyPrice: 19.99,
    annualPrice: 179.99,
    readingsPerDay: -1,
    features: [
      "Everything in Pro",
      "Gift readings to friends",
      "Early access to new features",
      "Exclusive premium themes",
      "Personal destiny advisor",
    ],
    aiModel: "premium",
  },
};
