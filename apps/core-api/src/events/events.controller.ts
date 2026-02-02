import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../admin/admin.guard";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";

@ApiTags("Events")
@Controller()
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get("events/active")
  async getActiveEvents() {
    const data = await this.eventsService.getActiveEvents();
    return { success: true, data };
  }

  @Get("events")
  async getAllEvents() {
    const data = await this.eventsService.getAllEvents();
    return { success: true, data };
  }

  @Post("admin/events")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  async createEvent(@Body() body: CreateEventDto) {
    const event = await this.eventsService.createEvent({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
    return { success: true, data: event };
  }
}
