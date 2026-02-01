import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { StripeService } from "./stripe.service";

@Controller("stripe")
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post("create-checkout")
  @UseGuards(AuthGuard("jwt"))
  async createCheckout(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    if (!user) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
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
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    try {
      const result = await this.stripeService.handleWebhook(
        (req as any).rawBody || req.body,
        signature,
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
