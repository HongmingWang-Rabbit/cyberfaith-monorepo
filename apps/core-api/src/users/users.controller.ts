import { Controller, Get, Req, UseGuards, Inject, NotFoundException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { DRIZZLE } from "../db/drizzle.provider";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("users")
export class UsersController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @Get()
  findAll() {
    return { success: true, data: [] };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async me(@Req() req: AuthRequest) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        subscriptionTier: users.subscriptionTier,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) throw new NotFoundException("User not found");

    return { success: true, data: user };
  }
}
