export interface Plan {
  id: "free" | "pro";
  name: string;
  price: number; // monthly in USD
  readingsPerDay: number; // -1 = unlimited
  features: string[];
  aiModel: "basic" | "priority";
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    readingsPerDay: 5,
    features: ["5 AI readings per day", "Basic analysis", "Standard AI model"],
    aiModel: "basic",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9.99,
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
};
