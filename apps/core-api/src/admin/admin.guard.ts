import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Request } from "express";
import { DRIZZLE } from "../db/drizzle.provider";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as { id: string; email: string } | undefined;

    if (!user) {
      throw new ForbiddenException("Authentication required");
    }

    const [dbUser] = await this.db.select().from(users).where(eq(users.id, user.id));

    if (!dbUser || dbUser.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
