import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { Request } from "express";
import { DRIZZLE } from "../db/drizzle.provider";
import { users, readings } from "../db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { PLANS } from "../stripe/plans";

@Injectable()
export class TierLimitGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as { id: string } | undefined;

    if (!user) return true; // Let auth guards handle unauthenticated

    const [dbUser] = await this.db.select().from(users).where(eq(users.id, user.id));
    const tier = dbUser?.subscriptionTier || "free";
    const plan = PLANS[tier];

    if (!plan || plan.readingsPerDay === -1) return true; // Unlimited

    // Count today's readings
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(readings)
      .where(
        and(
          eq(readings.userId, user.id),
          gte(readings.createdAt, startOfDay),
        ),
      );

    if ((result?.count || 0) >= plan.readingsPerDay) {
      throw new HttpException(
        {
          error: "Daily reading limit reached",
          limit: plan.readingsPerDay,
          tier,
          upgrade: tier === "free",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
