import { describe, it, expect, vi, beforeEach } from "vitest";
import { StripeService } from "../stripe.service";

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      customers: {
        create: vi.fn().mockResolvedValue({ id: "cus_test123" }),
      },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
        },
      },
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({
          type: "checkout.session.completed",
          data: {
            object: {
              metadata: { userId: "user-1" },
              subscription: "sub_test",
              customer: "cus_test",
            },
          },
        }),
      },
    })),
  };
});

describe("StripeService", () => {
  let service: StripeService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: "user-1", email: "test@test.com", stripeCustomerId: null }]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };

    service = new StripeService(mockDb);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return subscription status", async () => {
    mockDb.where.mockResolvedValue([{ subscriptionTier: "free", stripeSubscriptionId: null }]);
    const result = await service.getSubscriptionStatus("user-1");
    expect(result).toEqual({ tier: "free", stripeSubscriptionId: null });
  });

  it("should return pro status for subscribed user", async () => {
    mockDb.where.mockResolvedValue([{ subscriptionTier: "pro", stripeSubscriptionId: "sub_123" }]);
    const result = await service.getSubscriptionStatus("user-1");
    expect(result).toEqual({ tier: "pro", stripeSubscriptionId: "sub_123" });
  });

  it("should create checkout session", async () => {
    const url = await service.createCheckoutSession("user-1", "test@test.com");
    expect(url).toBe("https://checkout.stripe.com/test");
  });

  it("should handle webhook", async () => {
    const result = await service.handleWebhook(Buffer.from("{}"), "sig_test");
    expect(result).toEqual({ received: true });
    expect(mockDb.update).toHaveBeenCalled();
  });
});
