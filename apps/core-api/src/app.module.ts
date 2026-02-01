import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PointsModule } from "./points/points.module";
import { AchievementsModule } from "./achievements/achievements.module";

@Module({
  imports: [HealthModule, AuthModule, UsersModule, PointsModule, AchievementsModule],
})
export class AppModule {}
