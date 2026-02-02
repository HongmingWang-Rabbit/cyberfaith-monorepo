import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { DbModule } from "./db/db.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PointsModule } from "./points/points.module";
import { AchievementsModule } from "./achievements/achievements.module";
import { ReadingsModule } from "./readings/readings.module";
import { LoggerMiddleware } from "./common/logger.middleware";
import { CorsMiddleware } from "./common/cors.middleware";
import { RateLimitGuard } from "./common/rate-limit.guard";
import { StripeModule } from "./stripe/stripe.module";
import { ArcadeModule } from "./arcade/arcade.module";
import { MuyuModule } from "./arcade/muyu/muyu.module";
import { FriendsModule } from "./friends/friends.module";
import { AdminModule } from "./admin/admin.module";
import { EmailModule } from "./email/email.module";
import { HoroscopeModule } from "./horoscope/horoscope.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { CompatibilityModule } from "./compatibility/compatibility.module";
import { ReferralsModule } from "./referrals/referrals.module";
import { GiftsModule } from "./gifts/gifts.module";

@Module({
  imports: [DbModule, HealthModule, AuthModule, UsersModule, PointsModule, AchievementsModule, ReadingsModule, StripeModule, ArcadeModule, MuyuModule, FriendsModule, EmailModule, AdminModule, HoroscopeModule, NotificationsModule, CompatibilityModule, ReferralsModule, GiftsModule],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: () => new RateLimitGuard(60, 60_000),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, LoggerMiddleware).forRoutes("*");
  }
}
