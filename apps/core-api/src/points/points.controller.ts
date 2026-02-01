import { Controller, Get } from "@nestjs/common";

@Controller("points")
export class PointsController {
  @Get()
  findAll() {
    return { success: true, data: [] };
  }
}
