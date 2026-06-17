import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../shared/decorators/public.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Backend health check" })
  check() {
    return {
      status: "ok",
      service: "internal-boardroom-booking-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
