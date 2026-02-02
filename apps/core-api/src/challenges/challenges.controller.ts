import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { ChallengesService } from "./challenges.service";
import { CompleteChallengeDto } from "./dto";
import { Request } from "express";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Challenges")
@Controller("challenges")
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get("today")
  async getToday(@Req() req: AuthRequest) {
    // Optionally pass userId if authenticated (may be undefined if no JWT)
    const userId: string | undefined = req.user?.id;
    const result = await this.challengesService.getTodayChallenge(userId);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Post(":id/complete")
  async complete(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: CompleteChallengeDto,
  ) {
    const challengeId = id as string;
    const result = await this.challengesService.completeChallenge(req.user!.id, challengeId);

    if ("error" in result) {
      const errMsg = result.error as string;
      if (errMsg === "Challenge not found") {
        throw new AppException(ErrorCode.NOT_FOUND, errMsg, HttpStatus.NOT_FOUND);
      }
      throw new AppException(ErrorCode.VALIDATION_ERROR, errMsg, HttpStatus.CONFLICT);
    }

    return { success: true, data: result };
  }
}
