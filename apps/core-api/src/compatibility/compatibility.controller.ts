import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CompatibilityService } from "./compatibility.service";
import { CompatibilityDto } from "./dto";
import { Request } from "express";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Compatibility")
@Controller("readings/compatibility")
export class CompatibilityController {
  constructor(private compatibilityService: CompatibilityService) {}

  @Post()
  async getCompatibility(@Body() body: CompatibilityDto) {
    // Check cache first
    const cached = await this.compatibilityService.findCached(
      body.sign1,
      body.sign2,
      body.mbtiType1,
      body.mbtiType2,
    );

    if (cached) {
      return { success: true, data: cached.content, cached: true };
    }

    // No cache — return null so frontend calls its own AI endpoint
    // The core-api acts as cache layer; AI generation happens in destiny-loom
    return { success: true, data: null, cached: false };
  }

  @Post("save")
  async saveCompatibility(@Body() body: CompatibilityDto & { content: any }) {
    const result = await this.compatibilityService.saveResult(
      body.sign1,
      body.sign2,
      body.content,
      body.mbtiType1,
      body.mbtiType2,
    );
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("friend/:friendId")
  async getCompatibilityWithFriend(
    @Req() req: AuthRequest,
    @Param("friendId") friendId: string,
  ) {
    const [myProfile, friendProfile] = await Promise.all([
      this.compatibilityService.getUserProfile(req.user.id),
      this.compatibilityService.getFriendProfile(friendId, req.user.id),
    ]);

    if (!myProfile?.zodiacSign) {
      throw new AppException(
        ErrorCode.ZODIAC_SIGN_NOT_SET,
        "Set your zodiac sign in your profile first",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!friendProfile.zodiacSign) {
      throw new AppException(
        ErrorCode.ZODIAC_SIGN_NOT_SET,
        "Your friend has not set their zodiac sign",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check cache
    const cached = await this.compatibilityService.findCached(
      myProfile.zodiacSign,
      friendProfile.zodiacSign,
    );

    return {
      success: true,
      data: cached?.content || null,
      cached: !!cached,
      mySign: myProfile.zodiacSign,
      friendSign: friendProfile.zodiacSign,
      friendName: friendProfile.name,
      friendAvatar: friendProfile.avatarUrl,
    };
  }
}
