import { Injectable, Inject, Logger } from "@nestjs/common";
import Stripe from "stripe";
import { DRIZZLE } from "../db/drizzle.provider";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(@Inject(DRIZZLE) private readonly db: any) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover",
    });
  }

  async createCheckoutSession(userId: string, email: string): Promise<string> {
    // Find or create Stripe customer
    const [user] = await this.db.select().from(users).where(eq(users.id, userId));
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO || "",
          quantity: 1,
        },
      ],
      success_url: `${process.env.DESTINY_LOOM_URL || "http://localhost:3002"}/en/pricing?success=true`,
      cancel_url: `${process.env.DESTINY_LOOM_URL || "http://localhost:3002"}/en/pricing?canceled=true`,
      metadata: { userId },
    });

    return session.url || "";
  }

  async getSubscriptionStatus(userId: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId));
    return {
      tier: user?.subscriptionTier || "free",
      stripeSubscriptionId: user?.stripeSubscriptionId || null,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw err;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
          await this.db
            .update(users)
            .set({
              subscriptionTier: "pro",
              stripeSubscriptionId: String(session.subscription),
              stripeCustomerId: String(session.customer),
            })
            .where(eq(users.id, userId));
          this.logger.log(`User ${userId} upgraded to pro`);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        if (status === "active") {
          await this.db
            .update(users)
            .set({ subscriptionTier: "pro" })
            .where(eq(users.stripeSubscriptionId, subscription.id));
        } else if (status === "canceled" || status === "unpaid" || status === "past_due") {
          await this.db
            .update(users)
            .set({ subscriptionTier: "free" })
            .where(eq(users.stripeSubscriptionId, subscription.id));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.db
          .update(users)
          .set({ subscriptionTier: "free", stripeSubscriptionId: null })
          .where(eq(users.stripeSubscriptionId, subscription.id));
        this.logger.log(`Subscription ${subscription.id} deleted, downgraded to free`);
        break;
      }
    }

    return { received: true };
  }
}
