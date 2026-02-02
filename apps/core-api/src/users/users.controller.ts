import { Controller, Get, Patch, Body, Req, UseGuards, Inject, NotFoundException, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { DRIZZLE } from "../db/drizzle.provider";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { SetZodiacDto } from "../horoscope/dto/zodiac.dto";

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
        zodiacSign: users.zodiacSign,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) throw new NotFoundException("User not found");

    return { success: true, data: user };
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("zodiac")
  async setZodiac(@Req() req: AuthRequest, @Body() body: SetZodiacDto) {
    const [updated] = await this.db
      .update(users)
      .set({ zodiacSign: body.zodiacSign })
      .where(eq(users.id, req.user.id))
      .returning({
        id: users.id,
        zodiacSign: users.zodiacSign,
      });

    if (!updated) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    return { success: true, data: updated };
  }
}
