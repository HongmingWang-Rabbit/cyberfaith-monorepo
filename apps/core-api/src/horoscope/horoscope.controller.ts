import { Controller, Get, Req, UseGuards, Inject, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { DRIZZLE } from "../db/drizzle.provider";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { HoroscopeService, isValidZodiacSign } from "./horoscope.service";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("readings")
export class HoroscopeController {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private horoscopeService: HoroscopeService,
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("daily-horoscope")
  async getDailyHoroscope(@Req() req: AuthRequest) {
    const [user] = await this.db
      .select({ zodiacSign: users.zodiacSign })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user?.zodiacSign) {
      throw new AppException(
        ErrorCode.ZODIAC_SIGN_NOT_SET,
        "Please set your zodiac sign first",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!isValidZodiacSign(user.zodiacSign)) {
      throw new AppException(
        ErrorCode.INVALID_ZODIAC_SIGN,
        "Invalid zodiac sign",
        HttpStatus.BAD_REQUEST,
      );
    }

    const horoscope = await this.horoscopeService.getDailyHoroscope(user.zodiacSign);

    return {
      success: true,
      data: {
        sign: user.zodiacSign,
        date: new Date().toISOString().slice(0, 10),
        ...horoscope,
      },
    };
  }
}
