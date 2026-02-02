import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { StripeService } from "./stripe.service";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

@ApiTags("Stripe")
@Controller("stripe")
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post("create-checkout")
  @UseGuards(AuthGuard("jwt"))
  async createCheckout(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    if (!user) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized", HttpStatus.UNAUTHORIZED);
    }
    const url = await this.stripeService.createCheckoutSession(user.id, user.email);
    return { url };
  }

  @Get("subscription")
  @UseGuards(AuthGuard("jwt"))
  async getSubscription(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.stripeService.getSubscriptionStatus(user.id);
  }

  @Post("webhook")
  async webhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      throw new AppException(ErrorCode.MISSING_STRIPE_SIGNATURE, "Missing stripe-signature header", HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.stripeService.handleWebhook(
        (req as any).rawBody || req.body,
        signature,
      );
      return res.json(result);
    } catch (err: any) {
      throw new AppException(ErrorCode.INVALID_STRIPE_SIGNATURE, err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
