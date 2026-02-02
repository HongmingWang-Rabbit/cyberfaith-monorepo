import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";
import { HealthService, type HealthReport } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthReport> {
    return this.healthService.getHealth();
  }
}
