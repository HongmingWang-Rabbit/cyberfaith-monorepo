import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FriendsService } from "./friends.service";
import { Request } from "express";
import { SendFriendRequestDto, SearchUsersDto } from "./dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("friends")
@UseGuards(AuthGuard("jwt"))
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post("request")
  async sendRequest(@Req() req: AuthRequest, @Body() body: SendFriendRequestDto) {
    const data = await this.friendsService.sendRequest(req.user.id, body.addresseeId);
    return { success: true, data };
  }

  @Post("accept/:id")
  async acceptRequest(@Req() req: AuthRequest, @Param("id") id: string) {
    const data = await this.friendsService.acceptRequest(id, req.user.id);
    return { success: true, data };
  }

  @Post("reject/:id")
  async rejectRequest(@Req() req: AuthRequest, @Param("id") id: string) {
    const data = await this.friendsService.rejectRequest(id, req.user.id);
    return { success: true, data };
  }

  @Delete(":id")
  async removeFriend(@Req() req: AuthRequest, @Param("id") id: string) {
    const data = await this.friendsService.removeFriend(id, req.user.id);
    return { success: true, data };
  }

  @Get()
  async listFriends(@Req() req: AuthRequest) {
    const data = await this.friendsService.listFriends(req.user.id);
    return { success: true, data };
  }

  @Get("requests")
  async listPendingRequests(@Req() req: AuthRequest) {
    const data = await this.friendsService.listPendingRequests(req.user.id);
    return { success: true, data };
  }

  @Get("search")
  async searchUsers(@Req() req: AuthRequest, @Query() query: SearchUsersDto) {
    const data = await this.friendsService.searchUsers(query.q || "", req.user.id);
    return { success: true, data };
  }

  @Get(":id/readings")
  async getFriendReadings(@Req() req: AuthRequest, @Param("id") id: string) {
    const data = await this.friendsService.getFriendReadings(id, req.user.id);
    return { success: true, data };
  }
}
