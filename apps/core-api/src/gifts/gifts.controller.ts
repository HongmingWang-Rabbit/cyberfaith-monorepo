import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Controller, Get, Post, Body, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GiftsService } from "./gifts.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Gifts")
@Controller("readings")
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("gift")
  async createGift(
    @Req() req: AuthRequest,
    @Body() body: { readingType: string; recipientEmail?: string; message?: string },
  ) {
    const gift = await this.giftsService.createGift(req.user.id, body);
    return { success: true, data: gift };
  }

  @Get("gift/:code")
  async getGift(@Param("code") code: string) {
    const gift = await this.giftsService.getGiftByCode(code);
    return { success: true, data: gift };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("gift/:code/redeem")
  async redeemGift(@Param("code") code: string, @Req() req: AuthRequest) {
    const gift = await this.giftsService.redeemGift(code, req.user.id);
    return { success: true, data: gift };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("gifts/sent")
  async sentGifts(@Req() req: AuthRequest) {
    const data = await this.giftsService.listSentGifts(req.user.id);
    return { success: true, data };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("gifts/received")
  async receivedGifts(@Req() req: AuthRequest) {
    const data = await this.giftsService.listReceivedGifts(req.user.id);
    return { success: true, data };
  }
}
